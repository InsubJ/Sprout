import type { GoogleIdTokenCredential } from "../../types/googleAuthentication";

export interface GoogleSignInButtonProps {
  disabled: boolean;
  onOAuthPress(): void;
  onIdToken(credential: GoogleIdTokenCredential): void;
  onError(message: string): void;
}
