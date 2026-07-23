import { useCallback } from "react";
import { usePersistedState } from "../../../hooks/usePersistedState";

export interface WaterReflectionDraft {
  habitId: string | null;
  note: string;
  imageUri: string | null;
}

interface WaterReflectionDraftState extends WaterReflectionDraft {
  hydrated: boolean;
  start(habitId: string): void;
  setNote(note: string): void;
  setImageUri(imageUri: string | null): void;
  discard(): void;
}

const emptyDraft: WaterReflectionDraft = { habitId: null, note: "", imageUri: null };

export function parseWaterReflectionDraft(value: unknown): WaterReflectionDraft {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Saved reflection draft is invalid");
  const candidate = value as Record<string, unknown>;
  if (candidate.habitId !== null && typeof candidate.habitId !== "string")
    throw new Error("Saved reflection habit is invalid");
  if (typeof candidate.habitId === "string" && !candidate.habitId.trim())
    throw new Error("Saved reflection habit is invalid");
  if (typeof candidate.note !== "string" || candidate.note.length > 500)
    throw new Error("Saved reflection note is invalid");
  if (candidate.imageUri !== null && typeof candidate.imageUri !== "string")
    throw new Error("Saved reflection image is invalid");
  if (typeof candidate.imageUri === "string" && !candidate.imageUri.trim())
    throw new Error("Saved reflection image is invalid");
  return {
    habitId: null, // Always start with sheet closed on cold start
    note: candidate.note,
    imageUri: candidate.imageUri,
  } as WaterReflectionDraft;
}

export function useWaterReflectionDraft(userId?: string): WaterReflectionDraftState {
  const persisted = usePersistedState<WaterReflectionDraft>(
    userId ? `sprout_water_reflection_draft_v1:${userId}` : null,
    emptyDraft,
    parseWaterReflectionDraft,
  );
  const start = useCallback(
    (habitId: string): void => {
      if (!habitId.trim()) throw new Error("A habit is required to start a reflection");
      persisted.setValue((current) =>
        current.habitId === habitId ? current : { ...emptyDraft, habitId },
      );
    },
    [persisted.setValue],
  );
  const setNote = useCallback(
    (note: string): void => persisted.setValue((current) => ({ ...current, note })),
    [persisted.setValue],
  );
  const setImageUri = useCallback(
    (imageUri: string | null): void => persisted.setValue((current) => ({ ...current, imageUri })),
    [persisted.setValue],
  );
  const discard = useCallback((): void => persisted.setValue(emptyDraft), [persisted.setValue]);
  return { ...persisted.value, hydrated: persisted.hydrated, start, setNote, setImageUri, discard };
}
