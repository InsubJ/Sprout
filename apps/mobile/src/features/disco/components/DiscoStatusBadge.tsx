import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet } from "react-native";
import type { DiscoPlantState } from "../hooks/useDiscoPlant";
const meta = { dancing: "🎉 Dancing!", smiling: "😄 Happy", withered: "🍂 Wilting" } as const;
export function DiscoStatusBadge({
  state,
  dark,
  plantGod = false,
}: {
  state: DiscoPlantState;
  dark: boolean;
  plantGod?: boolean;
}) {
  const shine = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
  }, []);
  useEffect(() => {
    if (state !== "dancing" || reduced) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [reduced, shine, state]);
  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        styles.base,
        plantGod ? styles.awakened : null,
        !dark && !plantGod ? styles.light : null,
        state === "dancing"
          ? styles.dancing
          : state === "smiling"
            ? styles.smiling
            : styles.withered,
        state === "dancing" && {
          transform: [{ scale: shine.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
          opacity: shine.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }),
        },
      ]}
    >
      {plantGod ? "✨ Awakened" : meta[state]}
    </Animated.Text>
  );
}
const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  dancing: {
    color: "#E5C7FF",
    backgroundColor: "rgba(199,125,255,.15)",
    borderColor: "rgba(199,125,255,.3)",
  },
  smiling: {
    color: "#8DD68F",
    backgroundColor: "rgba(76,175,80,.12)",
    borderColor: "rgba(76,175,80,.2)",
  },
  withered: {
    color: "#D6A57F",
    backgroundColor: "rgba(139,69,19,.1)",
    borderColor: "rgba(139,69,19,.3)",
  },
  light: { color: "#4D335B", backgroundColor: "rgba(255,255,255,.7)", borderColor: "#B894CC" },
  awakened: { color: "#FFF0A3", backgroundColor: "rgba(151,109,12,.35)", borderColor: "#C99A27" },
});
