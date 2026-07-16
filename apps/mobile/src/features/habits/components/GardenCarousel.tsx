import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { gardenCardGeometry } from "./gardenCardGeometry";

interface Props<Item> {
  items: readonly Item[];
  keyExtractor(item: Item): string;
  renderCard(item: Item, cardWidth: number): ReactElement;
  accessibilityLabel: string;
  cardHeight?: number;
  initialItemKey?: string | null;
  onFocusedItemChange?(itemKey: string): void;
}

const minimumWideCardWidth = 260;
const maximumCardsPerPage = 4;

export function carouselCardsPerPage(viewportWidth: number): number {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0)
    throw new Error("Carousel viewport width must be positive");
  const usableWidth = Math.max(240, viewportWidth - spacing.md * 2);
  return Math.min(
    maximumCardsPerPage,
    Math.max(1, Math.floor((usableWidth + spacing.md) / (minimumWideCardWidth + spacing.md))),
  );
}

export function carouselViewportWidth(windowWidth: number, measuredWidth: number | null): number {
  const width = measuredWidth ?? windowWidth;
  if (!Number.isFinite(width) || width <= 0)
    throw new Error("Carousel viewport width must be positive");
  return width;
}

export function carouselUsesManualSettling(platform: string): boolean {
  return platform === "web";
}

export function carouselIndexFromOffset(
  offset: number,
  interval: number,
  lastIndex: number,
): number {
  if (
    !Number.isFinite(offset) ||
    !Number.isFinite(interval) ||
    interval <= 0 ||
    !Number.isInteger(lastIndex) ||
    lastIndex < 0
  )
    throw new Error("Carousel measurements are invalid");
  return Math.max(0, Math.min(Math.round(offset / interval), lastIndex));
}

export function carouselIndexFromItemKey<Item>(
  items: readonly Item[],
  keyExtractor: (item: Item) => string,
  itemKey: string | null | undefined,
): number {
  if (!itemKey) return 0;
  const index = items.findIndex((item) => keyExtractor(item) === itemKey);
  return index < 0 ? 0 : index;
}

export function carouselLastStartIndex(itemCount: number, cardsPerPage: number): number {
  if (!Number.isInteger(itemCount) || itemCount < 0)
    throw new Error("Carousel item count must be a non-negative integer");
  if (!Number.isInteger(cardsPerPage) || cardsPerPage < 1)
    throw new Error("Carousel cards per page must be a positive integer");
  return Math.max(0, itemCount - cardsPerPage);
}

export function carouselStartIndexFromItemIndex(
  itemIndex: number,
  cardsPerPage: number,
  itemCount: number,
): number {
  if (!Number.isInteger(itemIndex) || itemIndex < 0)
    throw new Error("Carousel item index must be a non-negative integer");
  return Math.min(itemIndex, carouselLastStartIndex(itemCount, cardsPerPage));
}

export function carouselPositionLabel(
  startIndex: number,
  cardsPerPage: number,
  itemCount: number,
): string {
  if (!itemCount) return "No plants";
  const first = startIndex + 1;
  const last = Math.min(itemCount, first + cardsPerPage - 1);
  return first === last ? `${first} of ${itemCount}` : `${first}–${last} of ${itemCount}`;
}

export function GardenCarousel<Item>({
  items,
  keyExtractor,
  renderCard,
  accessibilityLabel,
  cardHeight = gardenCardGeometry.height,
  initialItemKey,
  onFocusedItemChange,
}: Props<Item>): React.JSX.Element {
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const viewportWidth = carouselViewportWidth(width, measuredWidth);
  const cardsPerPage = carouselCardsPerPage(viewportWidth);
  const initialItemIndex = carouselIndexFromItemKey(items, keyExtractor, initialItemKey);
  const initialStartIndex = carouselStartIndexFromItemIndex(
    initialItemIndex,
    cardsPerPage,
    items.length,
  );
  const listRef = useRef<FlatList<Item>>(null);
  const keyExtractorRef = useRef(keyExtractor);
  const focusedItemChangeRef = useRef(onFocusedItemChange);
  const webSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webTouchActive = useRef(false);
  const latestOffset = useRef(0);
  const focusedItemKey = useRef<string | null>(
    items[initialStartIndex] ? keyExtractor(items[initialStartIndex]) : (initialItemKey ?? null),
  );
  const [focusedStartIndex, setFocusedStartIndex] = useState(initialStartIndex);
  keyExtractorRef.current = keyExtractor;
  focusedItemChangeRef.current = onFocusedItemChange;

  const usableWidth = Math.max(240, viewportWidth - spacing.md * 2);
  const cardWidth = Math.min(
    gardenCardGeometry.width,
    Math.max(240, (usableWidth - spacing.md * (cardsPerPage - 1)) / cardsPerPage),
  );
  const interval = cardWidth + spacing.md;
  const occupiedWidth = cardWidth * cardsPerPage + spacing.md * (cardsPerPage - 1);
  const remainingWidth = Math.max(0, usableWidth - occupiedWidth);
  const leadingPadding =
    cardsPerPage === 1 ? Math.max(spacing.md, (viewportWidth - cardWidth) / 2) : spacing.md;
  const trailingPadding = cardsPerPage === 1 ? leadingPadding : spacing.md + remainingWidth;
  const lastStartIndex = carouselLastStartIndex(items.length, cardsPerPage);

  const rememberStartIndex = (startIndex: number): void => {
    const item = items[startIndex];
    if (!item) return;
    const itemKey = keyExtractor(item);
    if (focusedItemKey.current === itemKey) return;
    focusedItemKey.current = itemKey;
    onFocusedItemChange?.(itemKey);
  };

  useEffect(() => {
    const getItemKey = keyExtractorRef.current;
    const nextItemIndex = carouselIndexFromItemKey(items, getItemKey, focusedItemKey.current);
    const nextStartIndex = carouselStartIndexFromItemIndex(
      nextItemIndex,
      cardsPerPage,
      items.length,
    );
    const nextKey = items[nextStartIndex] ? getItemKey(items[nextStartIndex]) : null;
    focusedItemKey.current = nextKey;
    setFocusedStartIndex(nextStartIndex);
    if (nextKey) focusedItemChangeRef.current?.(nextKey);
    listRef.current?.scrollToOffset({ offset: nextStartIndex * interval, animated: false });
  }, [cardsPerPage, interval, items]);

  useEffect(
    () => () => {
      if (webSettleTimer.current) clearTimeout(webSettleTimer.current);
    },
    [],
  );

  const moveTo = (startIndex: number, animated = true): void => {
    const next = Math.max(0, Math.min(startIndex, lastStartIndex));
    listRef.current?.scrollToOffset({ offset: next * interval, animated });
    setFocusedStartIndex(next);
    rememberStartIndex(next);
  };

  const updateFocusedStartIndex = (offset: number): void => {
    const next = carouselIndexFromOffset(offset, interval, lastStartIndex);
    setFocusedStartIndex(next);
    rememberStartIndex(next);
  };

  const settleAtOffset = (offset: number, animated = true): void => {
    if (webSettleTimer.current) clearTimeout(webSettleTimer.current);
    webSettleTimer.current = null;
    moveTo(carouselIndexFromOffset(offset, interval, lastStartIndex), animated);
  };

  const measureViewport = (event: LayoutChangeEvent): void => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== measuredWidth) setMeasuredWidth(nextWidth);
  };

  const handleScroll = (offset: number): void => {
    latestOffset.current = offset;
    updateFocusedStartIndex(offset);
    if (Platform.OS !== "web") return;
    if (webSettleTimer.current) clearTimeout(webSettleTimer.current);
    webSettleTimer.current = setTimeout(() => {
      if (!webTouchActive.current) settleAtOffset(latestOffset.current);
    }, 140);
  };

  const handleScrollEndDrag = (offset: number): void => {
    if (carouselUsesManualSettling(Platform.OS)) {
      settleAtOffset(offset);
      return;
    }
    updateFocusedStartIndex(offset);
  };

  const handleMomentumScrollEnd = (offset: number): void => {
    settleAtOffset(offset, carouselUsesManualSettling(Platform.OS));
  };

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.root} onLayout={measureViewport}>
      <FlatList
        ref={listRef}
        horizontal
        nestedScrollEnabled
        disableScrollViewPanResponder={Platform.OS === "web"}
        data={items as Item[]}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <ScrollView
            nestedScrollEnabled
            directionalLockEnabled
            showsVerticalScrollIndicator
            style={{ width: cardWidth, height: cardHeight }}
            contentContainerStyle={{ minHeight: cardHeight }}
          >
            {renderCard(item, cardWidth)}
          </ScrollView>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{
          paddingLeft: leadingPadding,
          paddingRight: trailingPadding,
          paddingVertical: spacing.md,
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        initialNumToRender={Math.min(items.length, cardsPerPage + 2)}
        maxToRenderPerBatch={cardsPerPage + 2}
        windowSize={5}
        removeClippedSubviews={false}
        getItemLayout={(_data, index) => ({
          length: interval,
          offset: interval * index,
          index,
        })}
        initialScrollIndex={initialStartIndex || undefined}
        scrollEventThrottle={16}
        onTouchStart={() => {
          if (Platform.OS !== "web") return;
          webTouchActive.current = true;
          if (webSettleTimer.current) clearTimeout(webSettleTimer.current);
        }}
        onTouchEnd={() => {
          if (Platform.OS !== "web") return;
          webTouchActive.current = false;
          settleAtOffset(latestOffset.current);
        }}
        onTouchCancel={() => {
          if (Platform.OS !== "web") return;
          webTouchActive.current = false;
          settleAtOffset(latestOffset.current);
        }}
        onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(event) => handleScrollEndDrag(event.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={(event) => handleMomentumScrollEnd(event.nativeEvent.contentOffset.x)}
      />
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous plants"
          accessibilityState={{ disabled: focusedStartIndex === 0 }}
          disabled={focusedStartIndex === 0}
          onPress={() => moveTo(focusedStartIndex - 1)}
          style={({ pressed }) => [
            styles.arrow,
            focusedStartIndex === 0 && styles.arrowDisabled,
            pressed && styles.arrowPressed,
          ]}
        >
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.position}>
          {carouselPositionLabel(focusedStartIndex, cardsPerPage, items.length)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next plants"
          accessibilityState={{ disabled: focusedStartIndex >= lastStartIndex }}
          disabled={focusedStartIndex >= lastStartIndex}
          onPress={() => moveTo(focusedStartIndex + 1)}
          style={({ pressed }) => [
            styles.arrow,
            focusedStartIndex >= lastStartIndex && styles.arrowDisabled,
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
    minWidth: 92,
    color: colors.muted,
    textAlign: "center",
    fontFamily: "Outfit_600SemiBold",
  },
  separator: { width: spacing.md },
});
