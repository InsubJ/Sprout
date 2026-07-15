import { useEffect, useRef, useState } from "react";
import type { PlantGenerationJob } from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import { useDataRevision } from "../../../providers/DataProvider";
import {
  cacheSavedCustomPlant,
  readCachedGenerationJob,
  writeCachedGenerationJob,
} from "../services/customPlantCache";
import { createUuid } from "../utils/createUuid";
const activeStatuses = new Set([
  "queued",
  "moderating",
  "planning",
  "generating",
  "validating",
  "repairing",
]);
export function usePlantGeneration() {
  const { user } = useAuth();
  const { plantGeneration } = useServices();
  const { invalidate } = useDataRevision();
  const [job, setJob] = useState<PlantGenerationJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationInFlight = useRef(false);
  useEffect(() => {
    if (user) void readCachedGenerationJob(user.id).then(setJob);
  }, [user]);
  useEffect(() => {
    if (!job || !activeStatuses.has(job.status)) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const current = await plantGeneration.getJob(job.id);
        if (cancelled) return;
        setJob(current);
        if (user) await writeCachedGenerationJob(user.id, current);
        if (current.status === "failed")
          setError(current.failureMessage ?? "Plant generation could not be completed");
      } catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "Unable to check plant generation");
      }
    };
    const timer = setInterval(() => void refresh(), 3000);
    void refresh();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [job?.id, job?.status, plantGeneration, user]);
  async function generate(prompt: string): Promise<void> {
    if (generationInFlight.current) return;
    generationInFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const generated = await plantGeneration.generate(createUuid(), prompt);
      setJob(generated);
      if (user) await writeCachedGenerationJob(user.id, generated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to generate a plant");
    } finally {
      generationInFlight.current = false;
      setBusy(false);
    }
  }
  async function save(
    displayName: string,
    visibility: "friends" | "private" = "friends",
  ): Promise<boolean> {
    if (!job) throw new Error("No generated plant is ready");
    setBusy(true);
    setError(null);
    try {
      const saved = await plantGeneration.save(job.id, displayName, visibility);
      setJob(saved);
      if (user) await writeCachedGenerationJob(user.id, saved);
      if (user) {
        try {
          await cacheSavedCustomPlant(user.id, saved, visibility);
        } catch {
          // Saving succeeded on the server. Global invalidation below repairs cache if needed.
        }
      }
      invalidate();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the plant");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setJob(null);
    setError(null);
    if (user) void writeCachedGenerationJob(user.id, null);
  }
  return { job, busy, error, generate, save, reset };
}
