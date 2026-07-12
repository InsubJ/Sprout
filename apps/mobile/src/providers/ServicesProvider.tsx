import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
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
} from "@sprout/services";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DemoHabitRepository } from "../repositories/demoHabitRepository";
import { DemoInteractionRepository } from "../repositories/demoInteractionRepository";
import { DemoLogRepository } from "../repositories/demoLogRepository";
import { DemoProfileRepository } from "../repositories/demoProfileRepository";
import { DemoSocialRepository } from "../repositories/demoSocialRepository";
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
}
const ServicesContext = createContext<Services | null>(null);
export function ServicesProvider({ children }: PropsWithChildren) {
  const services = useMemo<Services>(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
    const key = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)?.trim();
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
    };
  }, []);
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}
export function useServices(): Services {
  const value = useContext(ServicesContext);
  if (!value)
    throw new Error("useServices must be used within ServicesProvider");
  return value;
}
