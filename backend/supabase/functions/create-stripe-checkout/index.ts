import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { browserCorsHeaders } from "../_shared/browserCorsHeaders.ts";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...browserCorsHeaders, "content-type": "application/json" },
  });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: browserCorsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const auth = req.headers.get("authorization");
  if (!auth) return json({ error: "Authentication required" }, 401);
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return json({ error: "Authentication required" }, 401);
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return json({ error: "Stripe support is not configured yet" }, 503);
  const body = await req.json().catch(() => ({}));
  const amountUsdCents = Number(body.amountUsdCents);
  if (!Number.isInteger(amountUsdCents) || amountUsdCents < 100)
    return json({ error: "Donation must be at least USD $1.00" }, 400);
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(amountUsdCents),
    "line_items[0][price_data][product_data][name]": "Support Sprout custom plants",
    "line_items[0][quantity]": "1",
    success_url:
      typeof body.successUrl === "string" ? body.successUrl : "https://sprout.app/support/success",
    cancel_url:
      typeof body.cancelUrl === "string" ? body.cancelUrl : "https://sprout.app/support/cancel",
    "metadata[user_id]": user.id,
    "metadata[reward]": "custom_plant_credit",
    "metadata[amount_usd_cents]": String(amountUsdCents),
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const result = await response.json();
  if (!response.ok) return json({ error: result.error?.message ?? "Stripe checkout failed" }, 502);
  return json({ checkoutUrl: result.url });
});
