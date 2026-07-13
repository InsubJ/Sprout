import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import {
  createSproutSupabaseClient,
  PersistentSyncQueue,
  SyncProcessor,
  SupabaseHabitRepository,
  SupabaseInteractionRepository,
  SupabaseLogRepository,
  SupabaseProfileRepository,
  SupabaseSocialRepository,
  SupabaseStorageRepository,
  type HabitRepository,
  type InteractionRepository,
  type LogRepository,
  type ProfileRepository,
  type SocialRepository,
  type StorageRepository,
  type CustomPlantRepository,
  type GenerationCreditRepository,
  type PlantGenerationRepository,
  SupabaseCustomPlantRepository,
  SupabaseGenerationCreditRepository,
  SupabasePlantGenerationRepository,
  SupabaseRewardedAdRepository,
  SupabaseSupportPaymentRepository,
  type RewardedAdRepository,
  type SupportPaymentRepository,
} from "@sprout/services";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DemoHabitRepository } from "../repositories/demoHabitRepository";
import { DemoInteractionRepository } from "../repositories/demoInteractionRepository";
import { DemoLogRepository } from "../repositories/demoLogRepository";
import { DemoProfileRepository } from "../repositories/demoProfileRepository";
import { DemoSocialRepository } from "../repositories/demoSocialRepository";
import { DemoCustomPlantRepository } from "../repositories/demoCustomPlantRepository";
import { DemoGenerationCreditRepository } from "../repositories/demoGenerationCreditRepository";
import { DemoPlantGenerationRepository } from "../repositories/demoPlantGenerationRepository";
import { DemoRewardedAdRepository } from "../repositories/demoRewardedAdRepository";
import { DemoSupportPaymentRepository } from "../repositories/demoSupportPaymentRepository";
import { customPlantFeatureFlags } from "../config/customPlantFeatureFlags";
import { consumeDemoGenerationCredit } from "../features/customPlants/services/demoRewardState";
interface Services {
  client: SupabaseClient | null;
  habits: HabitRepository;
  interactions: InteractionRepository | null;
  logs: LogRepository | null;
  profiles: ProfileRepository | null;
  social: SocialRepository | null;
  storage: StorageRepository | null;
  queue: PersistentSyncQueue;
  sync: SyncProcessor | null;
  isDemo: boolean;
  customPlants: CustomPlantRepository;
  generationCredits: GenerationCreditRepository;
  plantGeneration: PlantGenerationRepository;
  rewardedAds: RewardedAdRepository;
  supportPayments: SupportPaymentRepository;
}
const ServicesContext = createContext<Services | null>(null);
export function ServicesProvider({ children }: PropsWithChildren) {
  const services = useMemo<Services>(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
    const key = (
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    )?.trim();
    const queue = new PersistentSyncQueue(AsyncStorage);
    if (!url || !key) {
      const habits = new DemoHabitRepository();
      const logs = new DemoLogRepository(AsyncStorage, habits);
      return {
        client: null,
        habits,
        interactions: new DemoInteractionRepository(AsyncStorage),
        logs,
        profiles: new DemoProfileRepository(),
        social: new DemoSocialRepository(AsyncStorage),
        storage: null,
        queue,
        sync: null,
        isDemo: true,
        customPlants: new DemoCustomPlantRepository(AsyncStorage),
        generationCredits: new DemoGenerationCreditRepository(AsyncStorage),
        plantGeneration: new DemoPlantGenerationRepository(AsyncStorage),
        rewardedAds: new DemoRewardedAdRepository(AsyncStorage),
        supportPayments: new DemoSupportPaymentRepository(AsyncStorage),
      };
    }
    const client = createSproutSupabaseClient({
      url,
      anonKey: key,
      storage: AsyncStorage,
    });
    const habits = new SupabaseHabitRepository(client);
    const logs = new SupabaseLogRepository(client);
    const storage = new SupabaseStorageRepository(client);
    const previewCustomPlants = customPlantFeatureFlags.previewSimulationEnabled;
    return {
      client,
      habits,
      interactions: new SupabaseInteractionRepository(client),
      logs,
      profiles: new SupabaseProfileRepository(client),
      social: new SupabaseSocialRepository(client),
      storage,
      queue,
      sync: new SyncProcessor(queue, habits, logs, storage),
      isDemo: false,
      customPlants: new SupabaseCustomPlantRepository(client),
      generationCredits: previewCustomPlants
        ? new DemoGenerationCreditRepository(AsyncStorage)
        : new SupabaseGenerationCreditRepository(client),
      plantGeneration: new SupabasePlantGenerationRepository(client, {
        previewMode: previewCustomPlants,
        onPreviewSaved: async () => {
          const { data } = await client.auth.getUser();
          if (!data.user) throw new Error("Sign in to save a generated plant");
          await consumeDemoGenerationCredit(AsyncStorage, data.user.id);
        },
      }),
      rewardedAds: previewCustomPlants
        ? new DemoRewardedAdRepository(AsyncStorage)
        : new SupabaseRewardedAdRepository(client),
      supportPayments: previewCustomPlants
        ? new DemoSupportPaymentRepository(AsyncStorage)
        : new SupabaseSupportPaymentRepository(client),
    };
  }, []);
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
export function useServices(): Services {
  const value = useContext(ServicesContext);
  if (!value) throw new Error("useServices must be used within ServicesProvider");
  return value;
}
export function useIsDemoMode(): boolean {
  return useServices().isDemo;
}
