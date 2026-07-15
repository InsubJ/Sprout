import { useCallback } from "react";
import { usePersistedState } from "../../../hooks/usePersistedState";

interface PlantGenerationDraft {
  open: boolean;
  prompt: string;
}

interface PlantGenerationDraftState extends PlantGenerationDraft {
  hydrated: boolean;
  setOpen(open: boolean): void;
  setPrompt(prompt: string): void;
  clear(): void;
}

const emptyDraft: PlantGenerationDraft = { open: false, prompt: "" };

export function parsePlantGenerationDraft(value: unknown): PlantGenerationDraft {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Saved plant prompt is invalid");
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.open !== "boolean") throw new Error("Saved prompt visibility is invalid");
  if (typeof candidate.prompt !== "string" || candidate.prompt.length > 1000)
    throw new Error("Saved plant prompt is invalid");
  return { open: candidate.open, prompt: candidate.prompt };
}

export function usePlantGenerationDraft(userId?: string): PlantGenerationDraftState {
  const persisted = usePersistedState<PlantGenerationDraft>(
    userId ? `sprout_plant_generation_draft_v1:${userId}` : null,
    emptyDraft,
    parsePlantGenerationDraft,
  );
  const setOpen = useCallback(
    (open: boolean): void => persisted.setValue((current) => ({ ...current, open })),
    [persisted.setValue],
  );
  const setPrompt = useCallback(
    (prompt: string): void => persisted.setValue((current) => ({ ...current, prompt })),
    [persisted.setValue],
  );
  const clear = useCallback((): void => persisted.setValue(emptyDraft), [persisted.setValue]);
  return { ...persisted.value, hydrated: persisted.hydrated, setOpen, setPrompt, clear };
}
