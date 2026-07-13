import { describe, expect, it } from "vitest";
import { readSupabaseFunctionError } from "./supabaseFunctionError";

describe("readSupabaseFunctionError", () => {
  it("returns the Edge Function error and provider detail", async () => {
    const error = await readSupabaseFunctionError({
      context: {
        json: async () => ({ error: "Plant generation failed", detail: "rate_limited" }),
      },
    });

    expect(error.message).toBe("Plant generation failed: rate_limited");
  });

  it("preserves an SDK error when response JSON is unavailable", async () => {
    const sdkError = Object.assign(new Error("FunctionsHttpError"), {
      context: { json: async () => Promise.reject(new Error("invalid JSON")) },
    });

    await expect(readSupabaseFunctionError(sdkError)).resolves.toBe(sdkError);
  });
});
