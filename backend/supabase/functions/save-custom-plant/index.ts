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
  const url = Deno.env.get("SUPABASE_URL")!,
    anon = Deno.env.get("SUPABASE_ANON_KEY")!,
    service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return json({ error: "Authentication required" }, 401);
  const body = await req.json();
  const name = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (
    !/^[0-9a-f-]{36}$/i.test(body.jobId ?? "") ||
    !name ||
    name.length > 60 ||
    !["friends", "private"].includes(body.visibility)
  )
    return json({ error: "Invalid save request" }, 400);
  const admin = createClient(url, service);
  const { data: job, error } = await admin
    .from("plant_generation_jobs")
    .select("*")
    .eq("id", body.jobId)
    .eq("user_id", user.id)
    .single();
  if (error || !job) return json({ error: "Generation job not found" }, 404);
  if (job.status === "completed") return json(job);
  if (job.status !== "preview_ready" || !job.generated_spec)
    return json({ error: "Plant preview is not ready to save" }, 409);
  const existing = await admin
    .from("custom_plants")
    .select("id")
    .eq("generation_job_id", job.id)
    .maybeSingle();
  let plantId = existing.data?.id;
  if (!plantId) {
    const spec = job.generated_spec as any;
    const saved = await admin
      .from("custom_plants")
      .insert({
        user_id: user.id,
        display_name: name,
        original_prompt: job.original_prompt,
        sanitized_prompt: job.sanitized_prompt,
        description: spec.description,
        plant_spec: spec,
        render_version: 1,
        rarity: "custom",
        generation_job_id: job.id,
        visibility: body.visibility,
      })
      .select("id")
      .single();
    if (saved.error) return json({ error: saved.error.message }, 500);
    plantId = saved.data.id;
    await admin.from("custom_plant_log_entries").insert({
      custom_plant_id: plantId,
      user_id: user.id,
      details: {
        originalPrompt: job.original_prompt,
        sanitizedPrompt: job.sanitized_prompt,
        suggestedName: job.suggested_name,
        finalName: name,
        description: spec.description,
        geometryFamilies: spec.generationMetadata?.reusedGeometryFamilies ?? [],
        providerAttempts: job.provider_attempts,
      },
    });
    await admin.from("generation_credit_ledger").insert({
      user_id: user.id,
      event_type: "generation_consumed",
      credit_delta: 0,
      generation_job_id: job.id,
      source_event_id: `consumed:${job.id}`,
    });
  }
  const completed = await admin
    .from("plant_generation_jobs")
    .update({
      status: "completed",
      current_step: "Saved to Sanctuary",
      edited_name: name,
      custom_plant_id: plantId,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .select("*")
    .single();
  return json(completed.data);
});
