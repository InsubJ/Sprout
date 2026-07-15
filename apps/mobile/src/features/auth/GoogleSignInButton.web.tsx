import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";
import type { GoogleSignInButtonProps } from "./GoogleSignInButton.types";
import { useGoogleNonce } from "./useGoogleNonce";

const missingClientIdMessage =
  "Google login is not configured for web. Add EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID first.";

export function GoogleSignInButton({
  disabled,
  onIdToken,
  onError,
}: GoogleSignInButtonProps): React.JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { nonce, refresh } = useGoogleNonce(onError);
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID?.trim() ?? "";
  const buttonWidth = Math.max(180, Math.min(320, width - spacing.lg * 2 - spacing.xl * 2));

  if (!clientId)
    return (
      <Text accessibilityRole="alert" style={[styles.configurationError, { color: theme.muted }]}>
        {missingClientIdMessage}
      </Text>
    );

  if (!nonce)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.muted} />
      </View>
    );

  const handleSuccess = (response: CredentialResponse): void => {
    if (!response.credential) {
      onError("Google did not return a sign-in credential");
      void refresh();
      return;
    }
    onIdToken({ token: response.credential, nonce: nonce.raw });
    void refresh();
  };

  const handleError = (): void => {
    onError("Google sign-in could not be completed");
    void refresh();
  };

  return (
    <View
      pointerEvents={disabled ? "none" : "auto"}
      style={[styles.button, disabled && styles.disabled]}
    >
      <GoogleOAuthProvider clientId={clientId} nonce={nonce.sha256}>
        <GoogleLogin
          nonce={nonce.sha256}
          onError={handleError}
          onSuccess={handleSuccess}
          shape="pill"
          size="large"
          text="continue_with"
          theme={theme.dark ? "filled_black" : "outline"}
          width={buttonWidth}
        />
      </GoogleOAuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", minHeight: 44 },
  disabled: { opacity: 0.45 },
  loading: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  configurationError: { fontSize: 12, lineHeight: 18, textAlign: "center" },
});
