interface FunctionErrorContext {
  json(): Promise<unknown>;
}

interface FunctionErrorBody {
  error?: unknown;
  detail?: unknown;
}

function isFunctionErrorContext(value: unknown): value is FunctionErrorContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "json" in value &&
    typeof value.json === "function"
  );
}

function errorMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const { error, detail } = body as FunctionErrorBody;
  if (typeof error !== "string") return null;
  return typeof detail === "string" && detail.length > 0 ? `${error}: ${detail}` : error;
}

export async function readSupabaseFunctionError(cause: unknown): Promise<Error> {
  if (typeof cause !== "object" || cause === null || !("context" in cause)) {
    return cause instanceof Error ? cause : new Error("Edge Function request failed");
  }
  const context = cause.context;
  if (!isFunctionErrorContext(context)) {
    return cause instanceof Error ? cause : new Error("Edge Function request failed");
  }
  try {
    const message = errorMessage(await context.json());
    if (message) return new Error(message);
  } catch {
    // Preserve the SDK error when the response does not contain readable JSON.
  }
  return cause instanceof Error ? cause : new Error("Edge Function request failed");
}
