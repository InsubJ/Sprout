import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const encoder = new TextEncoder();
function hex(value: ArrayBuffer) {
  return [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function valid(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=")));
  if (!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = hex(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${parts.t}.${payload}`)),
  );
  return signature === parts.v1 && Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
}
Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET"),
    signature = req.headers.get("stripe-signature"),
    payload = await req.text();
  if (!secret || !signature || !(await valid(payload, signature, secret)))
    return new Response("Invalid signature", { status: 401 });
  const event = JSON.parse(payload),
    session = event.data?.object;
  if (event.type !== "checkout.session.completed") return new Response("ok");
  if (
    !session?.metadata?.user_id ||
    session.payment_status !== "paid" ||
    session.currency !== "usd" ||
    session.amount_total <= 100
  )
    return new Response("Ignored non-qualifying payment");
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const payment = await admin.from("support_payments").upsert(
    {
      user_id: session.metadata.user_id,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      stripe_customer_id: session.customer,
      amount_usd_cents: session.amount_total,
      currency: "usd",
      status: "paid",
      verified_at: new Date().toISOString(),
      credited_at: new Date().toISOString(),
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true },
  );
  if (payment.error) return new Response(payment.error.message, { status: 500 });
  const [payments, issued, balance] = await Promise.all([
    admin
      .from("support_payments")
      .select("amount_usd_cents")
      .eq("user_id", session.metadata.user_id)
      .eq("status", "paid"),
    admin
      .from("generation_credit_ledger")
      .select("credit_delta")
      .eq("user_id", session.metadata.user_id)
      .eq("event_type", "stripe_payment_verified"),
    admin
      .from("generation_credit_ledger")
      .select("credit_delta")
      .eq("user_id", session.metadata.user_id),
  ]);
  if (payments.error || issued.error || balance.error)
    return new Response("Unable to calculate donation credits", { status: 500 });
  const totalCents = (payments.data ?? []).reduce((sum, row) => sum + row.amount_usd_cents, 0),
    issuedCredits = (issued.data ?? []).reduce((sum, row) => sum + row.credit_delta, 0),
    available = (balance.data ?? []).reduce((sum, row) => sum + row.credit_delta, 0),
    creditDelta = Math.min(
      Math.max(0, 5 - available),
      Math.max(0, Math.floor(totalCents / 500) - issuedCredits),
    );
  if (creditDelta === 0) return new Response("ok");
  const credit = await admin.from("generation_credit_ledger").insert({
    user_id: session.metadata.user_id,
    event_type: "stripe_payment_verified",
    credit_delta: creditDelta,
    source_event_id: session.id,
    metadata: { paymentIntentId: session.payment_intent, remainderUsdCents: totalCents % 500 },
  });
  if (credit.error && credit.error.code !== "23505")
    return new Response(credit.error.message, { status: 500 });
  return new Response("ok");
});
