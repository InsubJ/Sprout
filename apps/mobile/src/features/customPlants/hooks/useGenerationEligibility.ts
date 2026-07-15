import { useCallback, useEffect, useState } from "react";
import type { GenerationCreditBalance } from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import {
  readCachedGenerationJob,
  readCachedGenerationCredits,
  writeCachedGenerationCredits,
} from "../services/customPlantCache";
import { readPlantGodActive, writePlantGodActive } from "../services/plantGodModeCache";
import { generationJobKeepsPlantGodActive } from "../utils/generationJobKeepsPlantGodActive";
const empty: GenerationCreditBalance = {
  availableCredits: 0,
  verifiedAdsTowardNextCredit: 0,
  adsRequiredPerCredit: 20,
  donationRemainderUsdCents: 0,
};
export function useGenerationEligibility() {
  const { user } = useAuth();
  const { generationCredits } = useServices();
  const [balance, setBalance] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plantGodActive, setPlantGodActive] = useState(false);
  const refresh = useCallback(async (): Promise<GenerationCreditBalance> => {
    if (!user) {
      setBalance(empty);
      setLoading(false);
      return empty;
    }
    setError(null);
    const [cached, cachedPlantGodActive, cachedJob] = await Promise.all([
      readCachedGenerationCredits(user.id),
      readPlantGodActive(user.id),
      readCachedGenerationJob(user.id),
    ]);
    const generationActive = generationJobKeepsPlantGodActive(cachedJob);
    setPlantGodActive(cachedPlantGodActive || generationActive);
    if (generationActive && !cachedPlantGodActive) await writePlantGodActive(user.id, true);
    if (cached) setBalance(cached);
    try {
      const fresh = await generationCredits.getBalance(user.id);
      setBalance(fresh);
      await writeCachedGenerationCredits(user.id, fresh);
      if (fresh.availableCredits === 0 && !generationActive) {
        setPlantGodActive(false);
        await writePlantGodActive(user.id, false);
      }
      return fresh;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to refresh generation credits");
      return cached ?? empty;
    } finally {
      setLoading(false);
    }
  }, [generationCredits, user]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const setActive = useCallback(
    async (active: boolean) => {
      if (!user) return;
      await writePlantGodActive(user.id, active);
      setPlantGodActive(active);
    },
    [user],
  );
  const rewardRecorded = useCallback(async () => {
    const refreshed = await refresh();
    await setActive(refreshed.availableCredits > 0);
  }, [refresh, setActive]);
  const finishGeneration = useCallback(async () => {
    await refresh();
    await setActive(false);
  }, [refresh, setActive]);
  return {
    balance,
    loading,
    error,
    refresh,
    eligible: balance.availableCredits > 0,
    plantGodActive,
    activatePlantGod: () => setActive(true),
    bankCredit: () => setActive(false),
    rewardRecorded,
    finishGeneration,
  };
}
