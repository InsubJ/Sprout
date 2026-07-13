import { extractJson, type PlantLlmProvider } from "./PlantLlmProvider.ts";
export class GeminiProvider implements PlantLlmProvider {
  readonly name = "gemini";
  readonly model = "gemini-2.5-flash";
  readonly configured: boolean;
  constructor(private readonly key: string | undefined) {
    this.configured = Boolean(key);
  }
  async generate(systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<unknown> {
    if (!this.key) throw new Error("configuration_missing");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.key}`,
      {
        method: "POST",
        signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!response.ok)
      throw new Error(
        response.status === 429
          ? "rate_limited"
          : response.status >= 500
            ? "unavailable"
            : `provider_${response.status}`,
      );
    const body = await response.json();
    return extractJson(body.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
  }
}
