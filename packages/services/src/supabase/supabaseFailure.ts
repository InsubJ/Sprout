import { RepositoryError, type RepositoryFailureCategory } from "../errors/repositoryError";

interface SupabaseFailure {
  code?: string;
  message: string;
}

const authorizationCodes = new Set(["42501", "PGRST301", "PGRST302"]);
const conflictCodes = new Set(["23503", "23505"]);
const validationCodes = new Set(["22P02", "23502", "23514", "PGRST204"]);
const unavailableCodes = new Set([
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  "08P01",
  "53300",
  "57P01",
  "57P02",
  "57P03",
]);

function categoryFor(error: SupabaseFailure): RepositoryFailureCategory {
  const numericCode = Number(error.code);
  if (numericCode === 401 || numericCode === 403) return "authorization";
  if (numericCode === 409) return "conflict";
  if (numericCode >= 500 && numericCode <= 599) return "service_unavailable";
  if (numericCode >= 400 && numericCode <= 499) return "validation";
  if (error.code && authorizationCodes.has(error.code)) return "authorization";
  if (error.code && conflictCodes.has(error.code)) return "conflict";
  if (error.code && validationCodes.has(error.code)) return "validation";
  if (error.code && unavailableCodes.has(error.code)) return "service_unavailable";
  if (/network request failed|failed to fetch|networkerror/i.test(error.message)) {
    return "network";
  }
  return "unknown";
}

export function toRepositoryError(action: string, error: SupabaseFailure): RepositoryError {
  return new RepositoryError(`${action}: ${error.message}`, categoryFor(error), {
    cause: error,
  });
}
