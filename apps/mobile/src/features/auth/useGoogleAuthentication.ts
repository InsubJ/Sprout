import { useCallback, useRef, useState } from "react";
import { useRouter } from "expo-router";
import type { GoogleIdTokenCredential } from "../../types/googleAuthentication";
import { useAuth, type DemoIdentity } from "../../providers/AuthProvider";

interface GoogleAuthenticationState {
  busy: boolean;
  error: string | null;
  signInWithGoogleOAuth(): Promise<void>;
  signInWithGoogleIdToken(credential: GoogleIdTokenCredential): Promise<void>;
  signInDemo(identity: DemoIdentity): Promise<void>;
  reportError(message: string): void;
}

export function useGoogleAuthentication(): GoogleAuthenticationState {
  const auth = useAuth();
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<boolean | void>): Promise<void> => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      try {
        const completed = await action();
        if (completed !== false) router.replace("/(tabs)/forest");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Google sign-in failed");
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [router],
  );

  const signInWithGoogleOAuth = useCallback(
    (): Promise<void> => run(auth.signInWithGoogleOAuth),
    [auth.signInWithGoogleOAuth, run],
  );
  const signInWithGoogleIdToken = useCallback(
    (credential: GoogleIdTokenCredential): Promise<void> =>
      run(() => auth.signInWithGoogleIdToken(credential)),
    [auth.signInWithGoogleIdToken, run],
  );
  const signInDemo = useCallback(
    (identity: DemoIdentity): Promise<void> => run(() => auth.signInDemo(identity)),
    [auth.signInDemo, run],
  );
  const reportError = useCallback((message: string): void => {
    setError(message);
  }, []);

  return {
    busy,
    error,
    signInWithGoogleOAuth,
    signInWithGoogleIdToken,
    signInDemo,
    reportError,
  };
}
