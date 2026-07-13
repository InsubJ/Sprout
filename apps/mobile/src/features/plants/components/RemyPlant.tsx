import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import {
  computeHumanoidBody,
  computeRemyFace,
  computeRemyLimbs,
  getGrowthState,
  type PlantProps,
  type RemyEyeType,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";

function RemyEye({ eye, cx }: { eye: RemyEyeType; cx: number }) {
  if (eye === "wink")
    return (
      <Path
        d={`M${cx - 4} 0 Q${cx} 4 ${cx + 4} 0`}
        stroke="#1F331E"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    );
  if (eye === "droopy")
    return (
      <Path
        d={`M${cx - 4} -2 Q${cx} 2 ${cx + 4} -3`}
        stroke="#1F331E"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    );
  if (eye === "sparkle")
    return (
      <G>
        <Circle cx={cx} cy={0} r={4} fill="#1F331E" />
        <Circle cx={cx - 1.2} cy={-1.2} r={1.2} fill="#FFF" />
      </G>
    );
  return <Circle cx={cx} cy={0} r={3.6} fill="#1F331E" />;
}
export function RemyPlant(props: PlantProps) {
  const { size = 260, witherCount = 0 } = props;
  const growth = getGrowthState(props);
  const body = computeHumanoidBody(growth.growthPercent);
  const limbs = computeRemyLimbs(body, growth.isWithered, growth.asymmetry);
  const face = computeRemyFace(
    growth.isWithered,
    growth.isCompleted,
    growth.finalVariant === "flawless",
  );
  const skin = growth.isWithered ? "#8CA3B8" : witherCount >= 2 ? "#3C6E9A" : "#2F6FA8";
  const hi = growth.isWithered ? "#B0C4D6" : "#5FA0D9";
  const leaf = growth.isWithered ? "#9DAAA0" : "#3B8F45";
  const cheek = growth.isWithered ? "#8FA3B0" : "#F2A6A6";
  const y = body.headY - body.headRadius * 0.4;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Remy at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#F2A6A6" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path
        d={limbs.leftLeg.path}
        stroke={skin}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={limbs.rightLeg.path}
        stroke={skin}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={limbs.leftLeg.endX} cy={limbs.leftLeg.endY} rx={8} ry={4} fill={leaf} />
      <Ellipse cx={limbs.rightLeg.endX} cy={limbs.rightLeg.endY} rx={8} ry={4} fill={leaf} />
      <Path
        d={`M193 ${body.hipY} L193 ${body.shoulderY} Q200 ${body.shoulderY - 6} 207 ${body.shoulderY} L207 ${body.hipY} Z`}
        fill={skin}
      />
      <Path
        d={limbs.leftArm.path}
        stroke={skin}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={limbs.rightArm.path}
        stroke={skin}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={limbs.leftArm.endX} cy={limbs.leftArm.endY} r={6} fill={skin} />
      <Circle cx={limbs.rightArm.endX} cy={limbs.rightArm.endY} r={6} fill={skin} />
      <Circle cx={200} cy={y} r={body.headRadius} fill={skin} />
      <Circle
        cx={200 - body.headRadius * 0.35}
        cy={y - body.headRadius * 0.35}
        r={body.headRadius * 0.3}
        fill={hi}
        opacity={0.5}
      />
      <Path
        d={`M${200 - body.headRadius * 0.3} ${y - body.headRadius} Q${200 - body.headRadius * 0.6} ${y - body.headRadius * 1.6} ${200 - body.headRadius * 0.1} ${y - body.headRadius * 1.2}`}
        stroke={leaf}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <G transform={`translate(200 ${y})`}>
        <RemyEye eye={face.leftEye} cx={-body.headRadius * 0.32} />
        <RemyEye eye={face.rightEye} cx={body.headRadius * 0.32} />
        {face.leftEye === "open" || face.leftEye === "wink" ? (
          <>
            <Circle
              cx={-body.headRadius * 0.55}
              cy={body.headRadius * 0.25}
              r={4}
              fill={cheek}
              opacity={0.6}
            />
            <Circle
              cx={body.headRadius * 0.55}
              cy={body.headRadius * 0.25}
              r={4}
              fill={cheek}
              opacity={0.6}
            />
          </>
        ) : null}
        <Path
          d={face.mouthPath}
          stroke="#1F331E"
          strokeWidth={2.5}
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
