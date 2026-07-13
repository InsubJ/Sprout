import { View } from "react-native";
import { AppButton } from "./AppButton";
import { ScreenState } from "./ScreenState";
export function ErrorState({ message, onRetry }: { message: string; onRetry?(): void }) {
  return (
    <View>
      <ScreenState message={message} error />
      {onRetry ? <AppButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}
