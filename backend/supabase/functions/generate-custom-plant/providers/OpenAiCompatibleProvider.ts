import { extractJson, type PlantLlmProvider, type ProviderName } from "./PlantLlmProvider.ts";
export class OpenAiCompatibleProvider implements PlantLlmProvider {
  configured: boolean;
  constructor(
    public readonly name: ProviderName,
    private readonly url: string,
    public readonly model: string,
    private readonly apiKey: string | undefined,
    private readonly headers: Record<string, string> = {},
    private readonly requestOptions: Record<string, unknown> = {},
  ) {
    this.configured = Boolean(apiKey);
  }
  async generate(systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<unknown> {
    if (!this.apiKey) throw new Error("configuration_missing");
    const response = await fetch(this.url, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
        ...this.headers,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        max_tokens: 2500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...this.requestOptions,
      }),
    });
    if (!response.ok) {
      const failure = await response.text();
      throw new Error(
        response.status === 429
          ? "rate_limited"
          : response.status >= 500
            ? "unavailable"
            : `provider_${response.status}:${failure.slice(0, 160)}`,
      );
    }
    const responseText = await response.text();
    if (!responseText.trim()) throw new Error("empty_response");
    let body: {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    try {
      body = JSON.parse(responseText);
    } catch {
      throw new Error("invalid_provider_response");
    }
    if (body.error) throw new Error(`provider_error:${body.error.message ?? "unknown"}`);
    const content = body.choices?.[0]?.message?.content;
    if (!content?.trim()) throw new Error("empty_completion");
    return extractJson(content);
  }
}
