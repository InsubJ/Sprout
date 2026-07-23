import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { DiscoPlantState } from "../hooks/useDiscoPlant";

const rays = [0, 45, 90, 135, 180, 225, 270, 315];
const rayColors = ["#ff6b9d", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff"];
const tiles = [
  [50, 40],
  [62, 40],
  [44, 52],
  [56, 52],
  [68, 52],
  [50, 64],
  [62, 64],
  [56, 76],
];
const tileColors = [
  "#fff",
  "#ff6b9d",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#c77dff",
  "#ff9f43",
  "#fff",
];
function Layer({ children, size = 180 }: { children: React.ReactNode; size?: number }) {
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 120 160">
      {children}
    </Svg>
  );
}
export function DiscoPlant({
  state,
  size = 180,
  dark = false,
}: {
  state: DiscoPlantState;
  size?: number;
  dark?: boolean;
}) {
  const dancing = state === "dancing";
  const withered = state === "withered";
  const jump = useRef(new Animated.Value(0)).current;
  const raySpin = useRef(new Animated.Value(0)).current;
  const tileFlash = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(1)).current;
  const star3 = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const values = [jump, raySpin, tileFlash, star1, star2, star3];
    values.forEach((value) => value.stopAnimation());
    if (!dancing || reduced) {
      values.forEach((value) => value.setValue(0));
      return;
    }
    const alternate = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    const animations = [
      alternate(jump, 700),
      Animated.loop(
        Animated.timing(raySpin, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      alternate(tileFlash, 600),
      alternate(star1, 800),
      alternate(star2, 1100),
      alternate(star3, 900),
    ];
    const animation = Animated.parallel(animations);
    animation.start();
    return () => animation.stop();
  }, [dancing, jump, raySpin, reduced, star1, star2, star3, tileFlash]);
  const wholeStyle = {
    transform: [
      { translateY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
      { rotate: jump.interpolate({ inputRange: [0, 1], outputRange: ["-3deg", "3deg"] }) },
      ...(withered ? [{ rotate: "12deg" }, { translateY: 6 }] : []),
    ],
  };
  const twinkle = (value: Animated.Value) => ({
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) }],
  });
  return (
    <Animated.View style={[{ width: size, height: size * 1.25 }, wholeStyle]}>
      <Layer size={size}>
        <Defs>
          <RadialGradient id="discoGrad" cx="40%" cy="35%" r="60%">
            <Stop offset="0" stopColor={dark ? "#e1bee7" : "#FFFFFF"} />
            <Stop offset="1" stopColor={dark ? "#7b1fa2" : "#A855C7"} />
          </RadialGradient>
          <LinearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={dark ? "#9c27b0" : "#C86DDB"} />
            <Stop offset="1" stopColor={dark ? "#5c35a8" : "#7650B4"} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={60}
          cy={55}
          r={dancing ? 35 : 32}
          fill={withered ? "#9e9e9e" : "url(#discoGrad)"}
          stroke={withered ? "#757575" : "#b388ff"}
          strokeWidth={2}
          opacity={dancing ? 0.28 : 1}
        />
        <Circle
          cx={60}
          cy={55}
          r={32}
          fill={withered ? "#9e9e9e" : "url(#discoGrad)"}
          stroke={withered ? "#757575" : "#b388ff"}
          strokeWidth={2}
        />
        {!withered && !dancing
          ? tiles.map(([x, y], index) => (
              <Rect
                key={index}
                x={x - 4}
                y={y - 4}
                width={8}
                height={8}
                rx={1}
                fill="#ececec"
                opacity={0.6}
              />
            ))
          : null}
        <Line x1={31} y1={48} x2={37} y2={51} stroke="#111827" strokeWidth={3} />
        <Rect
          x={36}
          y={45}
          width={18}
          height={12}
          rx={4}
          fill="#111827"
          stroke="#E9D5FF"
          strokeWidth={1.5}
        />
        <Rect
          x={56}
          y={45}
          width={18}
          height={12}
          rx={4}
          fill="#111827"
          stroke="#E9D5FF"
          strokeWidth={1.5}
        />
        <Line x1={54} y1={50} x2={56} y2={50} stroke="#111827" strokeWidth={3} />
        <Line x1={74} y1={51} x2={80} y2={48} stroke="#111827" strokeWidth={3} />
        {!withered ? (
          <>
            <Path d="M39 48 L50 48 L45 53 Z" fill="#C77DFF" opacity={0.75} />
            <Path d="M59 48 L70 48 L65 53 Z" fill="#FF6B9D" opacity={0.7} />
          </>
        ) : null}
        <Path
          d={withered ? "M48 70 Q60 65 72 70" : "M48 68 Q60 76 72 68"}
          stroke={withered ? "#333" : "#000"}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {withered ? (
          <Path
            d="M60 23 C55 18 48 16 44 20"
            stroke="#757575"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <Line
            x1={60}
            y1={23}
            x2={60}
            y2={10}
            stroke="#7e57c2"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}
        <Path d="M40 115 L44 95 L76 95 L80 115 Z" fill={withered ? "#8d6e63" : "url(#potGrad)"} />
        <Rect x={38} y={110} width={44} height={8} rx={4} fill={withered ? "#795548" : "#7e57c2"} />
        <Ellipse cx={60} cy={95} rx={18} ry={5} fill={withered ? "#6d4c41" : "#4a2e1a"} />
        {withered ? (
          <Path d="M44 60 C41 66 42 70 44 70 C46 70 47 66 44 60 Z" fill="#63B3ED" opacity={0.85} />
        ) : null}
      </Layer>
      {dancing ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              zIndex: -1,
              left: 0,
              top: (size * 55) / 120 - size / 2,
              width: size,
              height: size,
              transform: [
                {
                  rotate: raySpin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Svg width={size} height={size} viewBox="0 0 120 120">
              <G>
                {rays.map((angle, index) => (
                  <Line
                    key={angle}
                    x1={60}
                    y1={60}
                    x2={60 + 45 * Math.cos((angle * Math.PI) / 180)}
                    y2={60 + 45 * Math.sin((angle * Math.PI) / 180)}
                    stroke={rayColors[Math.floor(angle / 72) % 5] ?? rayColors[index % 5]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                ))}
              </G>
            </Svg>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { opacity: tileFlash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
            ]}
          >
            <Layer size={size}>
              {tiles.map(([x, y], index) => (
                <Rect
                  key={index}
                  x={x - 4}
                  y={y - 4}
                  width={8}
                  height={8}
                  rx={1}
                  fill={tileColors[index]}
                  opacity={0.95}
                />
              ))}
            </Layer>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.starOne, twinkle(star1)]}>
            <TextSymbol symbol="★" color="#FFD93D" />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.starTwo, twinkle(star2)]}>
            <TextSymbol symbol="✦" color="#FFF" />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.starThree, twinkle(star3)]}>
            <TextSymbol symbol="✧" color="#FF6B9D" />
          </Animated.View>
        </>
      ) : null}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Layer size={size}>
          <G transform={withered ? "rotate(10 60 50) translate(0 3)" : undefined}>
            <Line x1={31} y1={48} x2={37} y2={51} stroke={withered ? "#555" : "#111827"} strokeWidth={3} />
            <Rect
              x={36}
              y={45}
              width={18}
              height={12}
              rx={4}
              fill={withered ? "#333" : "#111827"}
              stroke={withered ? "#757575" : "#E9D5FF"}
              strokeWidth={1.5}
            />
            <Rect
              x={56}
              y={45}
              width={18}
              height={12}
              rx={4}
              fill={withered ? "#333" : "#111827"}
              stroke={withered ? "#757575" : "#E9D5FF"}
              strokeWidth={1.5}
            />
            <Line x1={54} y1={50} x2={56} y2={50} stroke={withered ? "#555" : "#111827"} strokeWidth={3} />
            <Line x1={74} y1={51} x2={80} y2={48} stroke={withered ? "#555" : "#111827"} strokeWidth={3} />
            {!withered ? (
              <>
                <Path d="M39 48 L50 48 L45 53 Z" fill="#C77DFF" opacity={0.75} />
                <Path d="M59 48 L70 48 L65 53 Z" fill="#FF6B9D" opacity={0.7} />
              </>
            ) : null}
          </G>
        </Layer>
      </View>
    </Animated.View>
  );
}
function TextSymbol({ symbol, color }: { symbol: string; color: string }) {
  return <Animated.Text style={{ color, fontSize: 18, fontWeight: "900" }}>{symbol}</Animated.Text>;
}
const styles = StyleSheet.create({
  starOne: { position: "absolute", left: "12%", top: "12%" },
  starTwo: { position: "absolute", right: "12%", top: "9%" },
  starThree: { position: "absolute", left: "6%", top: "48%" },
});
