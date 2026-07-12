import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export function WaterLimitTooltip({ visible }: { visible: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [progress, visible]);
  if (!visible) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.tooltip,
        {
          opacity: progress,
          transform: [
            { translateX: -89 },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.text}>Daily watering limit reached</Text>
      <View style={styles.arrow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    bottom: 48,
    left: 24,
    width: 178,
    backgroundColor: "rgba(33,33,33,.95)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
  text: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
    bottom: -5,
    left: 84,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(33,33,33,.95)",
  },
});
