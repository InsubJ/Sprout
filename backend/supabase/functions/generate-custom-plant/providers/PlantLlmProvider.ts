export type ProviderName = "groq" | "openrouter" | "gemini" | "deepseek" | "github_models";
export interface PlantLlmProvider {
  name: ProviderName;
  model: string;
  configured: boolean;
  generate(systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<unknown>;
}
export function extractJson(text: string): unknown {
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(clean);
}
