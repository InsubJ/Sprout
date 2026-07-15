import { useCallback } from "react";
import { usePersistedState } from "../../hooks/usePersistedState";

function parseCommentDraft(value: unknown): string {
  if (typeof value !== "string" || value.length > 500)
    throw new Error("Saved comment draft is invalid");
  return value;
}

interface ReflectionCommentDraftState {
  content: string;
  setContent(content: string): void;
  clear(): void;
}

export function useReflectionCommentDraft(
  userId: string | undefined,
  logId: string,
): ReflectionCommentDraftState {
  const storageKey = userId && logId.trim() ? `sprout_comment_draft_v1:${userId}:${logId}` : null;
  const persisted = usePersistedState(storageKey, "", parseCommentDraft);
  const setContent = useCallback(
    (content: string): void => persisted.setValue(content),
    [persisted.setValue],
  );
  const clear = useCallback((): void => persisted.setValue(""), [persisted.setValue]);
  return { content: persisted.value, setContent, clear };
}
