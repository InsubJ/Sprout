'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sprout_disco_plant';

export type DiscoPlantState = 'dancing' | 'smiling' | 'withered';

interface DiscoPlantData {
  lastWateredAt: string | null;
}

function computeState(lastWateredAt: string | null): DiscoPlantState {
  if (!lastWateredAt) return 'withered';
  const hoursSince = (Date.now() - new Date(lastWateredAt).getTime()) / (1000 * 60 * 60);
  if (hoursSince < 24) return 'dancing';
  if (hoursSince < 168) return 'smiling';
  return 'withered';
}

export function useDiscoPlant() {
  const [lastWateredAt, setLastWateredAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data: DiscoPlantData = JSON.parse(raw);
        setLastWateredAt(data.lastWateredAt);
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  const waterPlant = useCallback(() => {
    const now = new Date().toISOString();
    const data: DiscoPlantData = { lastWateredAt: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastWateredAt(now);
  }, []);

  const state: DiscoPlantState = computeState(lastWateredAt);

  return { state, lastWateredAt, waterPlant };
}
