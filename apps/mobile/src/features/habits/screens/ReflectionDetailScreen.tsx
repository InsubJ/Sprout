import { Image } from "expo-image";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { ResponsivePageContent } from "../../../components/ResponsivePageContent";
import { ScreenState } from "../../../components/ScreenState";
import { useTheme } from "../../../providers/ThemeProvider";
import { ReflectionInteractions } from "../../sanctuary/ReflectionInteractions";
import { useReflectionDetail } from "../hooks/useReflectionDetail";

export function ReflectionDetailScreen({ id }: { id?: string }): React.JSX.Element {
  const theme = useTheme();
  const entry = useReflectionDetail(id);
  if (entry === undefined) return <ScreenState message="Opening reflection…" />;
  if (!entry) return <ScreenState message="This reflection is unavailable or private." error />;
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: true, title: "Reflection" }} />
      <ResponsivePageContent style={styles.content}>
        {entry.image_url ? (
          <Image source={entry.image_url} style={styles.image} contentFit="cover" />
        ) : null}
        <Text style={[styles.copy, { color: theme.text }]}>
          {entry.note || "A moment of care."}
        </Text>
        <Text style={{ color: theme.muted }}>{new Date(entry.created_at).toLocaleString()}</Text>
        <ReflectionInteractions logId={entry.id} />
      </ResponsivePageContent>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: spacing.xl, gap: spacing.md },
  image: { width: "100%", height: 280, borderRadius: 20 },
  copy: { fontSize: 18, lineHeight: 26 },
});
