import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";

export function StreakIndicator({ streak, color }: { streak: number; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);
  useEffect(() => {
    if (reducedMotion) {
      scale.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 750, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, scale]);
  return (
    <View accessible accessibilityLabel={`${streak} streak`} style={styles.root}>
      <Animated.Text accessible={false} style={[styles.flame, { transform: [{ scale }] }]}>
        🔥
      </Animated.Text>
      <Text accessible={false} style={[styles.text, { color }]}>
        {streak} streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", gap: 5 },
  flame: { fontSize: 18 },
  text: { fontFamily: "Outfit_700Bold" },
});
