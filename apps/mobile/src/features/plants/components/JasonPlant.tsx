import Svg, { Circle, G, Path } from "react-native-svg";
import {
  computeJasonArms,
  computeJasonFace,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";

export function JasonPlant(props: PlantProps) {
  const { size = 260, witherCount = 0 } = props;
  const growth = getGrowthState(props);
  const face = computeJasonFace(
    growth.isWithered,
    growth.isCompleted,
    growth.finalVariant === "flawless",
  );
  const arms = computeJasonArms(growth.growthPercent, growth.isWithered, growth.asymmetry);
  const bodySize = 30 + growth.growthPercent * 0.35;
  const bodyColor = growth.isWithered ? "#9CA37C" : witherCount >= 2 ? "#5E9A5B" : "#4E9648";
  const highlight = growth.isWithered ? "#B0B491" : "#6FB35F";
  const cheek = growth.isWithered ? "#B79A7A" : "#F2A6A6";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Jason at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#F2A6A6" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path
        d="M200 300 L200 240"
        stroke={growth.isWithered ? "#8A9377" : "#3F7D3A"}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Path
        d={arms.leftArm.path}
        stroke={bodyColor}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={arms.rightArm.path}
        stroke={bodyColor}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle
        cx={arms.leftArm.handX}
        cy={arms.leftArm.handY}
        r={7}
        fill={bodyColor}
        opacity={growth.isWithered ? 0.7 : 1}
      />
      <Circle
        cx={arms.rightArm.handX}
        cy={arms.rightArm.handY}
        r={7}
        fill={bodyColor}
        opacity={growth.isWithered ? 0.7 : 1}
      />
      <Circle cx={200} cy={215} r={bodySize} fill={bodyColor} />
      <Circle cx={185} cy={200} r={bodySize * 0.35} fill={highlight} opacity={0.5} />
      <G>
        {face.eyeShape === "droopy" ? (
          <>
            <Path
              d="M182 205 Q186 210 190 206"
              stroke="#1F331E"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M210 206 Q214 210 218 205"
              stroke="#1F331E"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <Circle cx={186} cy={205} r={face.eyeShape === "happy" ? 5 : 4} fill="#1F331E" />
            <Circle cx={214} cy={205} r={face.eyeShape === "happy" ? 5 : 4} fill="#1F331E" />
          </>
        )}
        {face.eyeShape === "round" || face.eyeShape === "happy" ? (
          <>
            <Circle cx={175} cy={216} r={6} fill={cheek} opacity={0.6} />
            <Circle cx={225} cy={216} r={6} fill={cheek} opacity={0.6} />
          </>
        ) : null}
        <Path
          d={face.mouthPath}
          stroke="#1F331E"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </G>
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 178, cy: 296, rx: 6, ry: 4 },
            { cx: 224, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
