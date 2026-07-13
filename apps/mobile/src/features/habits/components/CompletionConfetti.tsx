import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
const palette = ["#E86A58", "#F4C542", "#75A665", "#6C8CD5", "#C778B5"];
export function CompletionConfetti() {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        left: `${(index * 37) % 100}%` as `${number}%`,
        color: palette[index % palette.length],
      })),
    [],
  );
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
  }, []);
  useEffect(() => {
    if (reduced) return;
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.piece,
            {
              left: piece.left,
              backgroundColor: piece.color,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 520 - (index % 8) * 10],
                  }),
                },
                {
                  rotate: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", `${360 + (index % 4) * 90}deg`],
                  }),
                },
              ],
              opacity: progress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            },
          ]}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  piece: { position: "absolute", top: 0, width: 9, height: 15, borderRadius: 2 },
});
