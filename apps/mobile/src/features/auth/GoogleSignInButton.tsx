import { GoogleSigninButton as NativeGoogleSigninButton } from "@react-native-google-signin/google-signin";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";
import type { GoogleSignInButtonProps } from "./GoogleSignInButton.types";

export function GoogleSignInButton({
  disabled,
  onOAuthPress,
}: GoogleSignInButtonProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <NativeGoogleSigninButton
        accessibilityLabel="Continue with Google"
        color={
          theme.dark ? NativeGoogleSigninButton.Color.Dark : NativeGoogleSigninButton.Color.Light
        }
        disabled={disabled}
        onPress={onOAuthPress}
        size={NativeGoogleSigninButton.Size.Wide}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 312, alignSelf: "center" },
  button: { width: "100%", height: 48 },
});
