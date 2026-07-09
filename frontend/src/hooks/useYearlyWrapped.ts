import { useState, useEffect, useCallback, useContext } from 'react';
import { YearlyWrappedData, WrappedService } from '../services/wrappedService';
import { WrappedServiceContext } from '../services/WrappedServiceContext';
import { createClient } from '@supabase/supabase-js';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

// Fallback/Demo data in case the database is empty or not running
const getDemoData = (userId: string, year: number): YearlyWrappedData => ({
  userId,
  year,
  totalPlanted: 14,
  totalCompleted: 9,
  tierRatios: {
    common: 6,
    uncommon: 4,
    rare: 3,
    mythical: 1,
  },
  averageResilienceIndex: 3.8,
  guardianAngel: {
    profile: {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'gardener_bob',
      display_name: 'Bob the Builder',
      avatar_url: null,
    },
    nudgeCount: 8,
  },
  socialEcho: {
    commentCount: 14,
    reactionCount: 32,
    totalInteractions: 46,
  },
});

export interface UseYearlyWrappedResult {
  data: YearlyWrappedData | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  fetchWrappedData: () => Promise<void>;
}

/**
 * Custom hook to load and manage Yearly Wrapped data.
 * Adheres to SRP by separating data fetching logic from React rendering.
 */
export function useYearlyWrapped(
  userId: string,
  year: number,
  customService?: WrappedService
): UseYearlyWrappedResult {
  const contextService = useContext(WrappedServiceContext);
  const service = customService || contextService;

  const [data, setData] = useState<YearlyWrappedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  const fetchWrappedData = useCallback(async () => {
    // DbC Preconditions
    if (!userId || !isValidUuid(userId)) {
      setError('User ID must be a valid UUID');
      return;
    }
    if (!year || typeof year !== 'number' || year < 2000 || year > 2100) {
      setError('Year must be a valid calendar year between 2000 and 2100');
      return;
    }

    setLoading(true);
    setError(null);
    setIsDemo(false);

    try {
      if (service) {
        const wrappedResult = await service.getYearlyWrapped(userId, year);
        
        // If the user has no habits at all, we might show demo data for aesthetic purposes
        if (wrappedResult.totalPlanted === 0 && wrappedResult.totalCompleted === 0) {
          setData(getDemoData(userId, year));
          setIsDemo(true);
        } else {
          setData(wrappedResult);
        }
      } else {
        // Fallback: try constructing from environment variables, or use demo data
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey);
          const localService = new WrappedService(client);
          const wrappedResult = await localService.getYearlyWrapped(userId, year);
          if (wrappedResult.totalPlanted === 0 && wrappedResult.totalCompleted === 0) {
            setData(getDemoData(userId, year));
            setIsDemo(true);
          } else {
            setData(wrappedResult);
          }
        } else {
          // No client configured in environment, use demo data
          setData(getDemoData(userId, year));
          setIsDemo(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching yearly wrapped data:', err);
      // Fail gracefully in UI and show demo data so the page never looks broken
      setData(getDemoData(userId, year));
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [userId, year, service]);

  useEffect(() => {
    fetchWrappedData();
  }, [fetchWrappedData]);

  return {
    data,
    loading,
    error,
    isDemo,
    fetchWrappedData,
  };
}
