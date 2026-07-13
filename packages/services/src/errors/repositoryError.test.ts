import { describe, expect, it } from "vitest";
import { RepositoryError, isRetryableRepositoryError } from "./repositoryError";
import { toRepositoryError } from "../supabase/supabaseFailure";

describe("repository failure contract", () => {
  it.each(["network", "service_unavailable"] as const)(
    "allows %s failures to retry",
    (category) => {
      expect(isRetryableRepositoryError(new RepositoryError("temporary", category))).toBe(true);
    },
  );

  it.each(["authorization", "conflict", "not_found", "validation", "unknown"] as const)(
    "does not retry %s failures",
    (category) => {
      expect(isRetryableRepositoryError(new RepositoryError("permanent", category))).toBe(false);
    },
  );

  it("classifies schema and constraint failures as permanent", () => {
    expect(
      toRepositoryError("create", { code: "PGRST204", message: "missing column" }).category,
    ).toBe("validation");
    expect(toRepositoryError("create", { code: "23505", message: "duplicate" }).category).toBe(
      "conflict",
    );
    expect(toRepositoryError("create", { code: "42501", message: "denied" }).category).toBe(
      "authorization",
    );
  });

  it("classifies connectivity failures as retryable", () => {
    expect(toRepositoryError("create", { message: "TypeError: Failed to fetch" }).category).toBe(
      "network",
    );
    expect(toRepositoryError("create", { code: "57P03", message: "starting up" }).category).toBe(
      "service_unavailable",
    );
  });
});
