import { groqPlantResponseFormat } from "./plantSpecJsonSchema.ts";
import { OpenAiCompatibleProvider } from "./providers/OpenAiCompatibleProvider.ts";
import type { PlantLlmProvider } from "./providers/PlantLlmProvider.ts";

interface GroqFreeModel {
  id: string;
  outputMode: "json_schema" | "json_object";
  reasoningEffort?: "low";
}

const groqFreeModels: GroqFreeModel[] = [
  { id: "openai/gpt-oss-20b", outputMode: "json_schema", reasoningEffort: "low" },
  { id: "openai/gpt-oss-120b", outputMode: "json_schema", reasoningEffort: "low" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", outputMode: "json_schema" },
  { id: "llama-3.3-70b-versatile", outputMode: "json_object" },
  { id: "qwen/qwen3-32b", outputMode: "json_object" },
  { id: "qwen/qwen3.6-27b", outputMode: "json_object" },
  { id: "llama-3.1-8b-instant", outputMode: "json_object" },
];

function boundedOutputTokens(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 4000;
  return Math.min(5000, Math.max(2000, parsed));
}

function createGroqProvider(model: GroqFreeModel): PlantLlmProvider {
  const responseFormat =
    model.outputMode === "json_schema"
      ? groqPlantResponseFormat
      : ({ type: "json_object" } as const);
  return new OpenAiCompatibleProvider(
    "groq",
    "https://api.groq.com/openai/v1/chat/completions",
    model.id,
    Deno.env.get("GROQ_API_KEY"),
    {},
    {
      response_format: responseFormat,
      temperature: 0.9,
      max_tokens: boundedOutputTokens(Deno.env.get("GROQ_PLANT_MAX_OUTPUT_TOKENS")),
      ...(model.reasoningEffort
        ? { reasoning_effort: model.reasoningEffort, reasoning_format: "hidden" }
        : {}),
    },
  );
}

export function createGroqFreeProviders(): PlantLlmProvider[] {
  return groqFreeModels.map(createGroqProvider);
}
