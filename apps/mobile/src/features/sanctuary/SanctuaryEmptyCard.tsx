import { StyleSheet, useWindowDimensions, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { GardenEmptyCard } from "../habits/components/GardenEmptyCard";
import { gardenCardGeometry } from "../habits/components/gardenCardGeometry";

export function SanctuaryEmptyCard({ filtered }: { filtered: boolean }): React.JSX.Element {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(gardenCardGeometry.width, Math.max(240, width - spacing.md * 2));
  return (
    <View style={styles.container}>
      <GardenEmptyCard
        width={cardWidth}
        icon="🌱"
        title={filtered ? "No plants match these filters" : "Your Sanctuary is waiting"}
        copy={
          filtered
            ? "Try a different search or filter to reveal more plants."
            : "Complete a habit or create a custom plant, and its story will bloom here."
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md },
});
