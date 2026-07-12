import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { gardenCardGeometry } from "./gardenCardGeometry";

interface Props<Item> {
  items: readonly Item[];
  keyExtractor(item: Item): string;
  renderCard(item: Item, cardWidth: number): ReactElement;
  accessibilityLabel: string;
  cardHeight?: number;
}

export function GardenCarousel<Item>({
  items,
  keyExtractor,
  renderCard,
  accessibilityLabel,
  cardHeight = gardenCardGeometry.height,
}: Props<Item>) {
  const listRef = useRef<FlatList<Item>>(null);
  const { width } = useWindowDimensions();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cardWidth = Math.min(
    gardenCardGeometry.width,
    Math.max(240, width - spacing.md * 2),
  );
  const interval = cardWidth + spacing.md;
  const sidePadding = Math.max(spacing.md, (width - cardWidth) / 2);
  const lastIndex = Math.max(0, items.length - 1);
  useEffect(() => {
    setFocusedIndex((current) => Math.min(current, lastIndex));
  }, [lastIndex]);
  const moveTo = (index: number) => {
    const next = Math.max(0, Math.min(index, lastIndex));
    listRef.current?.scrollToOffset({
      offset: next * interval,
      animated: true,
    });
    setFocusedIndex(next);
  };
  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.root}>
      <FlatList
        ref={listRef}
        horizontal
        data={items as Item[]}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, height: cardHeight }}>
            {renderCard(item, cardWidth)}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          paddingVertical: spacing.md,
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        getItemLayout={(_data, index) => ({
          length: interval,
          offset: interval * index,
          index,
        })}
        onMomentumScrollEnd={(event) =>
          setFocusedIndex(
            Math.max(
              0,
              Math.min(
                Math.round(event.nativeEvent.contentOffset.x / interval),
                lastIndex,
              ),
            ),
          )
        }
      />
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous plant"
          accessibilityState={{ disabled: focusedIndex === 0 }}
          disabled={focusedIndex === 0}
          onPress={() => moveTo(focusedIndex - 1)}
          style={({ pressed }) => [
            styles.arrow,
            focusedIndex === 0 && styles.arrowDisabled,
            pressed && styles.arrowPressed,
          ]}
        >
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.position}>
          {items.length
            ? `${focusedIndex + 1} of ${items.length}`
            : "No plants"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next plant"
          accessibilityState={{ disabled: focusedIndex >= lastIndex }}
          disabled={focusedIndex >= lastIndex}
          onPress={() => moveTo(focusedIndex + 1)}
          style={({ pressed }) => [
            styles.arrow,
            focusedIndex >= lastIndex && styles.arrowDisabled,
            pressed && styles.arrowPressed,
          ]}
        >
          <Text style={styles.arrowText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%" },
  controls: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
    shadowColor: colors.forest,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  arrowDisabled: { opacity: 0.3, shadowOpacity: 0 },
  arrowPressed: { transform: [{ scale: 0.94 }] },
  arrowText: {
    color: colors.paper,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Outfit_700Bold",
  },
  position: {
    minWidth: 72,
    color: colors.muted,
    textAlign: "center",
    fontFamily: "Outfit_600SemiBold",
  },
  separator: { width: spacing.md },
});
