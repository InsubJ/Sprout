import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@sprout/design-tokens";
export function Avatar({
  uri,
  label,
  size = 48,
}: {
  uri?: string | null;
  label: string;
  size?: number;
}) {
  return uri ? (
    <Image
      accessibilityLabel={label}
      source={uri}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <View
      accessibilityLabel={label}
      style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text>{label.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.leaf },
});
