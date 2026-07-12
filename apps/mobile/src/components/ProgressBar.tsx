import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { colors, radii } from "@sprout/design-tokens";

export function ProgressBar({ progress, tone = "forest", trackColor }: { progress: number; tone?: "forest" | "disco"; trackColor?: string }) {
  const normalized = Math.max(0, Math.min(progress, 1));
  const animated = useRef(new Animated.Value(normalized)).current;
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion); }, []);
  useEffect(() => {
    if (reducedMotion) { animated.setValue(normalized); return; }
    const animation = Animated.timing(animated, { toValue: normalized, duration: 500, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [animated, normalized, reducedMotion]);
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(normalized * 100) }} style={[styles.track, trackColor ? { backgroundColor: trackColor } : null]}><Animated.View style={[styles.fill, tone === "disco" && styles.disco, { width: animated.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} /></View>;
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radii.pill, overflow: "hidden", backgroundColor: colors.leaf },
  fill: { height: "100%", backgroundColor: colors.forest, borderRadius: radii.pill },
  disco: { backgroundColor: colors.purple },
});
