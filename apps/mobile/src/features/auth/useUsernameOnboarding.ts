import { useCallback, useEffect, useRef, useState } from "react";
import { RepositoryError } from "@sprout/services";
import type { Profile } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export type UsernameOnboardingStatus = "loading" | "required" | "complete" | "error";

interface UsernameOnboardingState {
  status: UsernameOnboardingStatus;
  busy: boolean;
  error: string | null;
  chooseUsername(username: string): Promise<void>;
  refresh(): Promise<void>;
}

export function requiresUsernameOnboarding(profile: Profile): boolean {
  return profile.username_set_at === null;
}

export function useUsernameOnboarding(): UsernameOnboardingState {
  const { user } = useAuth();
  const { profiles, isDemo } = useServices();
  const [status, setStatus] = useState<UsernameOnboardingStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    const currentRequest = ++requestId.current;
    if (!user || !profiles || isDemo) {
      setStatus("complete");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const profile = await profiles.getById(user.id);
      if (currentRequest !== requestId.current) return;
      if (!profile) throw new Error("Your garden profile is not ready yet");
      setStatus(requiresUsernameOnboarding(profile) ? "required" : "complete");
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Unable to check your username");
    }
  }, [isDemo, profiles, user]);

  useEffect(() => {
    void refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);

  const chooseUsername = useCallback(
    async (username: string): Promise<void> => {
      setBusy(true);
      setError(null);
      try {
        if (!user || !profiles) throw new Error("Sign in before choosing a username");
        await profiles.setInitialUsername(user.id, username);
        setStatus("complete");
      } catch (cause) {
        setError(
          cause instanceof RepositoryError && cause.category === "conflict"
            ? "That username is already taken. Please choose another one."
            : cause instanceof Error
              ? cause.message
              : "Unable to set username",
        );
      } finally {
        setBusy(false);
      }
    },
    [profiles, user],
  );

  return { status, busy, error, chooseUsername, refresh };
}
