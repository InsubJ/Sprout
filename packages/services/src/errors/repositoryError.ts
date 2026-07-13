export type RepositoryFailureCategory =
  | "network"
  | "service_unavailable"
  | "authorization"
  | "conflict"
  | "not_found"
  | "validation"
  | "unknown";

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly category: RepositoryFailureCategory,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "RepositoryError";
  }
}

export function isRetryableRepositoryError(cause: unknown): boolean {
  return (
    cause instanceof RepositoryError &&
    (cause.category === "network" || cause.category === "service_unavailable")
  );
}
