import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "@sprout/design-tokens";
const rainbow = ["#C77DFF", "#FF6B9D", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF"];
export function shouldAnimateDiscoEnergy(progress: number, dancing: boolean): boolean {
  return dancing || progress >= 1;
}
export function DiscoEnergyBar({ progress, dancing }: { progress: number; dancing: boolean }) {
  const normalized = Math.max(0, Math.min(1, progress));
  const animated = shouldAnimateDiscoEnergy(normalized, dancing);
  const slide = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
  }, []);
  useEffect(() => {
    slide.stopAnimation();
    slide.setValue(0);
    if (!animated || reduced || !width) return;
    const animation = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [animated, reduced, slide, width]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(normalized * 100) }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.track}
    >
      <View style={[styles.clip, { width: `${normalized * 100}%` }]}>
        {animated ? (
          <Animated.View
            style={[
              styles.rainbow,
              {
                width: Math.max(width * 2, 1),
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -width],
                    }),
                  },
                ],
              },
            ]}
          >
            {[0, 1].flatMap((cycle) =>
              rainbow.map((color, index) => (
                <View
                  key={`${cycle}-${index}`}
                  style={{ width: Math.max(width / rainbow.length, 1), backgroundColor: color }}
                />
              )),
            )}
          </Animated.View>
        ) : (
          <View style={styles.normal} />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(199,125,255,.18)",
  },
  clip: { height: "100%", overflow: "hidden" },
  normal: { width: "100%", height: "100%", backgroundColor: colors.purple },
  rainbow: { height: "100%", flexDirection: "row" },
});
