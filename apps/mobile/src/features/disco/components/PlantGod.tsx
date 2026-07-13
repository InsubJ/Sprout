import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { createPlantGodAuraRays } from "../utils/plantGodAuraGeometry";
const rays = createPlantGodAuraRays();
export function PlantGod({
  size = 180,
  dark = false,
}: {
  size?: number;
  dark?: boolean;
}): React.JSX.Element {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(0);
    if (reducedMotion) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, reducedMotion]);
  return (
    <Animated.View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.12] }) },
          ],
        },
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        accessibilityLabel="Majestic Plant God, ready to create a custom plant"
      >
        <Defs>
          <RadialGradient id="divineHalo" cx="50%" cy="45%" r="55%">
            <Stop offset="0" stopColor={dark ? "#6E5A18" : "#FFFCE0"} />
            <Stop offset=".5" stopColor={dark ? "#B38A16" : "#FFE67A"} />
            <Stop offset="1" stopColor="#E6A900" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="robe" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#167A58" />
            <Stop offset=".55" stopColor="#275D3A" />
            <Stop offset="1" stopColor="#123D2A" />
          </LinearGradient>
          <LinearGradient id="crown" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF7A8" />
            <Stop offset="1" stopColor="#E6A800" />
          </LinearGradient>
        </Defs>
        <Circle cx="200" cy="184" r="172" fill="url(#divineHalo)" opacity={dark ? 0.72 : 1} />
        <G stroke="#D29A00" strokeWidth="5" strokeLinecap="round" opacity=".62">
          {rays.map((ray) => (
            <Line key={ray.angle} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
          ))}
        </G>
        <Circle
          cx="200"
          cy="174"
          r="116"
          fill="none"
          stroke={dark ? "#C79A25" : "#F6C936"}
          strokeWidth="8"
        />
        <Circle cx="200" cy="174" r="100" fill="none" stroke="#FFF5A8" strokeWidth="3" />
        <Path
          d="M86 328 Q105 240 153 218 Q200 196 247 218 Q295 240 314 328 Z"
          fill="url(#robe)"
          stroke="#DDAF20"
          strokeWidth="7"
        />
        <Path
          d="M105 318 Q78 280 104 242 Q137 252 154 287"
          fill="#2D8B61"
          stroke="#DDAF20"
          strokeWidth="6"
        />
        <Path
          d="M295 318 Q322 280 296 242 Q263 252 246 287"
          fill="#2D8B61"
          stroke="#DDAF20"
          strokeWidth="6"
        />
        <Path
          d="M146 220 Q200 252 254 220 L244 319 Q200 350 156 319 Z"
          fill="#F4D24F"
          opacity=".34"
        />
        <Ellipse
          cx="200"
          cy="169"
          rx="70"
          ry="76"
          fill={dark ? "#5F9B59" : "#9BD77C"}
          stroke="#F7D85A"
          strokeWidth="7"
        />
        <Path d="M148 149 Q200 112 252 149 Q241 104 200 94 Q159 104 148 149 Z" fill="#4F9E57" />
        <Path
          d="M151 110 L169 55 L198 91 L225 45 L242 94 L275 63 L257 128 Q200 105 143 128 Z"
          fill="url(#crown)"
          stroke="#B57F00"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <G fill="#FFF9C7" stroke="#B57F00" strokeWidth="3">
          <Circle cx="169" cy="58" r="9" />
          <Circle cx="225" cy="48" r="10" />
          <Circle cx="274" cy="65" r="9" />
        </G>
        <Path
          d="M178 165 Q188 153 198 165"
          fill="none"
          stroke="#183F2D"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Path
          d="M202 165 Q212 153 222 165"
          fill="none"
          stroke="#183F2D"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Circle cx="188" cy="164" r="4" fill="#FFFCE0" />
        <Circle cx="212" cy="164" r="4" fill="#FFFCE0" />
        <Path
          d="M175 196 Q200 218 225 196"
          fill="none"
          stroke="#183F2D"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Path
          d="M200 216 C172 235 169 273 200 293 C231 273 228 235 200 216 Z"
          fill="#6BCB77"
          stroke="#F8D657"
          strokeWidth="5"
        />
        <Path
          d="M200 228 L200 278 M200 248 Q181 238 176 228 M200 260 Q219 250 224 239"
          fill="none"
          stroke="#255B3B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <G fill="#FFF5A8">
          <Circle cx="116" cy="196" r="9" />
          <Circle cx="284" cy="196" r="9" />
          <Circle cx="125" cy="96" r="7" />
          <Circle cx="280" cy="111" r="7" />
        </G>
        <Rect x="124" y="326" width="152" height="24" rx="12" fill="#9A6719" />
        <Path
          d="M138 344 L151 382 L249 382 L262 344 Z"
          fill="#C58A30"
          stroke="#805218"
          strokeWidth="5"
        />
      </Svg>
    </Animated.View>
  );
}
const styles = StyleSheet.create({ frame: { alignItems: "center", justifyContent: "center" } });
