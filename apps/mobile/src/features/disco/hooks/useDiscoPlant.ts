import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
export type DiscoPlantState = "dancing" | "smiling" | "withered";
const key = "sprout_disco_plant";
export function computeDiscoState(lastWateredAt: string | null, now = Date.now()): DiscoPlantState {
  if (!lastWateredAt) return "withered";
  const hours = (now - new Date(lastWateredAt).getTime()) / 3_600_000;
  return hours < 24 ? "dancing" : hours < 48 ? "smiling" : "withered";
}
export interface DiscoPlantStateResult {
  state: DiscoPlantState;
  lastWateredAt: string | null;
  waterPlant: () => Promise<void>;
}
export function useDiscoPlant(): DiscoPlantStateResult {
  const [lastWateredAt, setLastWateredAt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (active && raw)
          setLastWateredAt((JSON.parse(raw) as { lastWateredAt: string }).lastWateredAt);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const waterPlant = useCallback(async (): Promise<void> => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(key, JSON.stringify({ lastWateredAt: now }));
    setLastWateredAt(now);
  }, []);
  return {
    state: useMemo(() => computeDiscoState(lastWateredAt), [lastWateredAt]),
    lastWateredAt,
    waterPlant,
  };
}
