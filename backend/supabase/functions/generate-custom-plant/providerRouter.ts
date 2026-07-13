import { GeminiProvider } from "./providers/GeminiProvider.ts";
import { OpenAiCompatibleProvider } from "./providers/OpenAiCompatibleProvider.ts";
import type { PlantLlmProvider, ProviderName } from "./providers/PlantLlmProvider.ts";
import { openRouterPlantResponseFormat } from "./plantSpecJsonSchema.ts";
import { createGroqFreeProviders } from "./groqProviderFactory.ts";

interface OpenRouterFreeModel {
  id: string;
  structuredOutput: boolean;
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

// Prioritize instruction models that advertise response_format support.
const openRouterFreeModels: OpenRouterFreeModel[] = [
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", structuredOutput: true },
  { id: "google/gemma-4-26b-a4b-it:free", structuredOutput: true },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", structuredOutput: true },
  { id: "openai/gpt-oss-20b:free", structuredOutput: true },
  { id: "nvidia/nemotron-nano-9b-v2:free", structuredOutput: true },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", structuredOutput: true },
  { id: "google/gemma-4-31b-it:free", structuredOutput: false },
  { id: "tencent/hy3:free", structuredOutput: false },
  { id: "openai/gpt-oss-120b:free", structuredOutput: false },
  { id: "meta-llama/llama-3.3-70b-instruct:free", structuredOutput: false },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", structuredOutput: false },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", structuredOutput: false },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", structuredOutput: false },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", structuredOutput: false },
  { id: "qwen/qwen3-coder:free", structuredOutput: false },
  { id: "poolside/laguna-m.1:free", structuredOutput: false },
  { id: "poolside/laguna-xs-2.1:free", structuredOutput: false },
  { id: "cohere/north-mini-code:free", structuredOutput: false },
  { id: "meta-llama/llama-3.2-3b-instruct:free", structuredOutput: false },
  { id: "liquid/lfm-2.5-1.2b-instruct:free", structuredOutput: false },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", structuredOutput: false },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", structuredOutput: false },
];

function createOpenRouterProvider(
  model: OpenRouterFreeModel,
  fallbackModels: OpenRouterFreeModel[],
): PlantLlmProvider {
  const reasoningTokens = boundedInteger(
    Deno.env.get("PLANT_LLM_REASONING_TOKENS"),
    2000,
    1024,
    4000,
  );
  const requestedMaxTokens = boundedInteger(
    Deno.env.get("PLANT_LLM_MAX_OUTPUT_TOKENS"),
    6500,
    4000,
    12000,
  );
  const maxTokens = Math.min(12000, Math.max(requestedMaxTokens, reasoningTokens + 3000));
  const outputOptions = model.structuredOutput
    ? {
        response_format: openRouterPlantResponseFormat,
        plugins: [{ id: "response-healing" }],
        provider: { require_parameters: true, allow_fallbacks: true },
      }
    : {
        response_format: undefined,
        provider: { allow_fallbacks: true },
      };
  return new OpenAiCompatibleProvider(
    "openrouter",
    "https://openrouter.ai/api/v1/chat/completions",
    model.id,
    Deno.env.get("OPENROUTER_API_KEY"),
    { "HTTP-Referer": "https://sprout.app", "X-Title": "Sprout" },
    {
      ...outputOptions,
      models: fallbackModels.map((fallback) => fallback.id),
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: maxTokens,
      reasoning: { max_tokens: reasoningTokens, exclude: true },
    },
  );
}

function createOpenRouterFallbackGroups(): PlantLlmProvider[] {
  const structured = openRouterFreeModels.filter((model) => model.structuredOutput);
  const promptOnly = openRouterFreeModels.filter((model) => !model.structuredOutput);
  return [...createModelBatches(structured), ...createModelBatches(promptOnly)];
}

function createModelBatches(models: OpenRouterFreeModel[]): PlantLlmProvider[] {
  const providers: PlantLlmProvider[] = [];
  for (let offset = 0; offset < models.length; offset += 4) {
    const batch = models.slice(offset, offset + 4);
    const primary = batch[0];
    if (primary) providers.push(createOpenRouterProvider(primary, batch.slice(1)));
  }
  return providers;
}

const factories: Record<Exclude<ProviderName, "openrouter" | "groq">, () => PlantLlmProvider> = {
  gemini: () => new GeminiProvider(Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY")),
  deepseek: () =>
    new OpenAiCompatibleProvider(
      "deepseek",
      "https://api.deepseek.com/chat/completions",
      "deepseek-chat",
      Deno.env.get("DEEPSEEK_API_KEY"),
    ),
  github_models: () =>
    new OpenAiCompatibleProvider(
      "github_models",
      "https://models.github.ai/inference/chat/completions",
      "openai/gpt-4.1-mini",
      Deno.env.get("GITHUB_MODELS_TOKEN"),
    ),
};

export function configuredProviders(): PlantLlmProvider[] {
  const requested = (
    Deno.env.get("PLANT_LLM_PROVIDER_ORDER") ?? "openrouter,groq,gemini,deepseek,github_models"
  )
    .split(",")
    .map((value) => value.trim() as ProviderName);
  const groups = requested.map((name): PlantLlmProvider[] => {
    if (name === "openrouter") return createOpenRouterFallbackGroups();
    if (name === "groq") return createGroqFreeProviders();
    const factory = factories[name as keyof typeof factories];
    return factory ? [factory()] : [];
  });
  const [primary = [], ...fallbacks] = groups;
  return [primary[0], ...fallbacks.flat(), ...primary.slice(1)].filter(
    (provider): provider is PlantLlmProvider => Boolean(provider?.configured),
  );
}
