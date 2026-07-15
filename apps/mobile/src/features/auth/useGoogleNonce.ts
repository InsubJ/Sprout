import { useCallback, useEffect, useState } from "react";
import { createGoogleNonce, type GoogleNonce } from "./utils/googleNonce";

interface GoogleNonceState {
  nonce: GoogleNonce | null;
  refresh(): Promise<void>;
}

export function useGoogleNonce(onError: (message: string) => void): GoogleNonceState {
  const [nonce, setNonce] = useState<GoogleNonce | null>(null);
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setNonce(await createGoogleNonce());
    } catch (cause) {
      setNonce(null);
      onError(cause instanceof Error ? cause.message : "Unable to prepare Google sign-in");
    }
  }, [onError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { nonce, refresh };
}
