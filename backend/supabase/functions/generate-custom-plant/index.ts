import { withSupabase } from "npm:@supabase/server";
import { initialChecklist } from "./generationChecklist.ts";
import { generationRuntimeConfig } from "./generationRuntimeConfig.ts";
import { moderatePrompt } from "./promptModeration.ts";
import { configuredProviders } from "./providerRouter.ts";
import { PLANT_CREATION_GUIDE } from "./plantCreationGuide.ts";
import { normalizePlantSpec } from "./plantSpecNormalizer.ts";
import { validatePlantSpec } from "./plantSpecValidator.ts";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function completeGeneration(admin: any, job: any, prompt: string, previewMode: boolean) {
  const providers = configuredProviders();
  const runtime = generationRuntimeConfig();
  const attempts: any[] = [];
  let spec: any = null;
  await admin
    .from("plant_generation_jobs")
    .update({ status: "planning", current_step: "Planning palette and reusable geometry" })
    .eq("id", job.id);
  for (let callIndex = 0; callIndex < runtime.maxCalls && providers.length > 0; callIndex += 1) {
    const provider = providers[callIndex % providers.length];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), runtime.attemptTimeoutMs);
    try {
      await admin
        .from("plant_generation_jobs")
        .update({
          status: "generating",
          current_step: `Generating plant geometry · stage ${callIndex + 1}`,
          active_provider: provider.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      const generated = await provider.generate(
        `${PLANT_CREATION_GUIDE}\nReturn only strict JSON matching schemaVersion 1.`,
        prompt,
        controller.signal,
      );
      const candidate = normalizePlantSpec(generated, prompt);
      await admin
        .from("plant_generation_jobs")
        .update({ status: "validating", current_step: "Validating generated geometry" })
        .eq("id", job.id);
      const validation = validatePlantSpec(candidate);
      if (!validation.valid) throw new Error(`invalid_schema: ${validation.errors.join(", ")}`);
      spec = candidate;
      attempts.push({
        provider: provider.name,
        model: provider.model,
        attempt: attempts.length + 1,
        status: "succeeded",
      });
      break;
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "cancelled_or_timed_out"
          : error instanceof Error
            ? error.message
            : "unknown";
      attempts.push({
        provider: provider.name,
        model: provider.model,
        attempt: attempts.length + 1,
        status: "failed",
        failureCode: message.split(":")[0],
        message: message.slice(0, 200),
      });
    } finally {
      clearTimeout(timer);
    }
  }
  if (spec) {
    await admin
      .from("plant_generation_jobs")
      .update({
        status: "preview_ready",
        current_step: "Your plant is ready to add to Sanctuary",
        provider_attempts: attempts,
        attempt_count: attempts.length,
        active_provider: attempts.at(-1)?.provider,
        generated_spec: spec,
        suggested_name: spec.displayName,
        checklist: initialChecklist.map((item) => ({ ...item, status: "complete" })),
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    return;
  }
  await admin
    .from("plant_generation_jobs")
    .update({
      status: "failed",
      current_step: "Generation failed",
      provider_attempts: attempts,
      attempt_count: attempts.length,
      failure_code: providers.length ? "providers_exhausted" : "configuration_missing",
      failure_message: providers.length
        ? "Every configured provider failed"
        : "No LLM provider keys are configured",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);
  if (!previewMode)
    await admin.from("generation_credit_ledger").insert({
      user_id: job.user_id,
      event_type: "generation_refunded",
      credit_delta: 1,
      generation_job_id: job.id,
      source_event_id: `refund:${job.id}`,
    });
  console.error("Plant generation providers exhausted", { jobId: job.id, attempts });
}
export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const {
      data: { user },
    } = await ctx.supabase.auth.getUser();
    if (!user) return json({ error: "Authentication required" }, 401);
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const requestId = body.requestId,
      prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!/^[0-9a-f-]{36}$/i.test(requestId ?? ""))
      return json({ error: "Invalid request ID" }, 400);
    const moderation = moderatePrompt(prompt);
    if (!moderation.accepted)
      return json({ error: "Prompt was not accepted", category: moderation.category }, 422);
    const admin = ctx.supabaseAdmin;
    const previewMode = body.previewMode === true && Boolean(Deno.env.get("OPENROUTER_API_KEY"));
    const existing = await admin
      .from("plant_generation_jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("request_id", requestId)
      .maybeSingle();
    if (existing.data) return json(existing.data);
    const active = await admin
      .from("plant_generation_jobs")
      .select("*")
      .eq("user_id", user.id)
      .in("status", [
        "queued",
        "moderating",
        "planning",
        "generating",
        "validating",
        "repairing",
        "preview_ready",
        "saving",
      ])
      .order("created_at", { ascending: false })
      .limit(1);
    const activeJob = active.data?.[0];
    if (activeJob) {
      const staleBefore = Date.now() - 90_000;
      const canResume =
        activeJob.status === "preview_ready" ||
        new Date(activeJob.updated_at).getTime() >= staleBefore;
      if (canResume) return json(activeJob);
      await admin
        .from("plant_generation_jobs")
        .update({
          status: "failed",
          current_step: "Generation interrupted",
          failure_code: "execution_interrupted",
          failure_message: "The previous function execution ended before generation completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeJob.id);
      const reservation = await admin
        .from("generation_credit_ledger")
        .select("id")
        .eq("generation_job_id", activeJob.id)
        .eq("event_type", "generation_reserved")
        .maybeSingle();
      if (reservation.data)
        await admin.from("generation_credit_ledger").insert({
          user_id: user.id,
          event_type: "generation_refunded",
          credit_delta: 1,
          generation_job_id: activeJob.id,
          source_event_id: `refund:${activeJob.id}`,
        });
    }
    const previewDailyLimit = Number(Deno.env.get("PLANT_PREVIEW_DAILY_LIMIT") ?? 0);
    if (previewMode && Number.isInteger(previewDailyLimit) && previewDailyLimit > 0) {
      const since = new Date(Date.now() - 86_400_000).toISOString();
      const { count, error } = await admin
        .from("plant_generation_jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", [
          "planning",
          "generating",
          "validating",
          "preview_ready",
          "saving",
          "completed",
        ])
        .gte("created_at", since);
      if (error) return json({ error: "Unable to check preview generation limit" }, 500);
      if ((count ?? 0) >= previewDailyLimit)
        return json(
          {
            error: "Preview generation limit reached. Try again tomorrow.",
            code: "preview_daily_limit",
          },
          429,
        );
    }
    const balance = await admin
      .from("generation_credit_ledger")
      .select("credit_delta")
      .eq("user_id", user.id);
    const available = (balance.data ?? []).reduce(
      (sum: number, row: any) => sum + row.credit_delta,
      0,
    );
    if (!previewMode && available < 1)
      return json({ error: "A generation credit is required" }, 402);
    const inserted = await admin
      .from("plant_generation_jobs")
      .insert({
        user_id: user.id,
        request_id: requestId,
        status: "generating",
        original_prompt: prompt,
        sanitized_prompt: moderation.sanitizedPrompt,
        current_step: "Generating a safe plant specification",
        checklist: initialChecklist.map((item) =>
          item.id === "moderate" || item.id === "plan" ? { ...item, status: "complete" } : item,
        ),
        started_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (inserted.error) return json({ error: inserted.error.message }, 500);
    const job = inserted.data;
    if (!previewMode)
      await admin.from("generation_credit_ledger").insert({
        user_id: user.id,
        event_type: "generation_reserved",
        credit_delta: -1,
        generation_job_id: job.id,
        source_event_id: job.credit_reservation_id,
      });
    const generation = completeGeneration(admin, job, moderation.sanitizedPrompt, previewMode);
    const edgeRuntime = (globalThis as any).EdgeRuntime;
    if (edgeRuntime?.waitUntil) edgeRuntime.waitUntil(generation);
    else void generation;
    return json(job, 202);
  }),
};
