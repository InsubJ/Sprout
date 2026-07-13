import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import {
  computeDogBody,
  computeDogEars,
  computeDogFace,
  computeDogLegs,
  computeDogTail,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function SprigPlant(props: PlantProps) {
  const { size = 260, witherCount = 0 } = props;
  const growth = getGrowthState(props);
  const body = computeDogBody(growth.growthPercent);
  const legs = computeDogLegs(body, growth.isWithered, growth.asymmetry);
  const face = computeDogFace(
    growth.isWithered,
    growth.isCompleted,
    growth.finalVariant === "flawless",
  );
  const frontX = 200 - body.bodyLength / 2 + 10;
  const backX = 200 + body.bodyLength / 2 - 10;
  const x = frontX - body.headRadius * 0.7;
  const y = body.torsoY - body.bodyHeight * 0.1;
  const ears = computeDogEars(x, y, body.headRadius, growth.isWithered);
  const tail = computeDogTail(backX + 6, body.torsoY, body.tailLength, growth.isWithered);
  const coat = growth.isWithered ? "#9CA37C" : witherCount >= 2 ? "#7FA35E" : "#6FA050";
  const hi = growth.isWithered ? "#B0B491" : "#8FC26C";
  const ear = growth.isWithered ? "#8FA37E" : "#4E8A3F";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Sprig at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#8FC26C" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path
        d={tail}
        stroke={ear}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        opacity={growth.isWithered ? 0.7 : 1}
      />
      {[legs.frontLeft, legs.frontRight, legs.backLeft, legs.backRight].map((leg, i) => (
        <G key={i}>
          <Path d={leg.path} stroke={coat} strokeWidth={7} strokeLinecap="round" />
          <Ellipse
            cx={leg.pawX}
            cy={leg.pawY}
            rx={6}
            ry={3.5}
            fill={ear}
            opacity={growth.isWithered ? 0.6 : 1}
          />
        </G>
      ))}
      <Ellipse
        cx={200}
        cy={body.torsoY}
        rx={body.bodyLength / 2}
        ry={body.bodyHeight / 2}
        fill={coat}
      />
      <Ellipse
        cx={200 - body.bodyLength * 0.15}
        cy={body.torsoY - body.bodyHeight * 0.2}
        rx={body.bodyLength * 0.18}
        ry={body.bodyHeight * 0.18}
        fill={hi}
        opacity={0.5}
      />
      <Path d={ears.left.path} stroke={ear} strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d={ears.right.path} stroke={ear} strokeWidth={9} strokeLinecap="round" fill="none" />
      <Circle cx={x} cy={y} r={body.headRadius} fill={coat} />
      <Ellipse
        cx={x}
        cy={y + body.headRadius * 0.28}
        rx={body.headRadius * 0.5}
        ry={body.headRadius * 0.34}
        fill={hi}
        opacity={0.9}
      />
      <G transform={`translate(${x} ${y})`}>
        {face.eyeShape === "droopy" ? (
          <>
            <Path
              d="M-11 -7 Q-7 -4 -3 -7"
              stroke="#2F2A20"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M3 -7 Q7 -4 11 -7"
              stroke="#2F2A20"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : face.eyeShape === "sparkle" ? (
          <>
            <Circle cx={-7} cy={-7} r={3.2} fill="#2F2A20" />
            <Circle cx={-8.2} cy={-8.2} r={1} fill="#FFF" />
            <Circle cx={7} cy={-7} r={3.2} fill="#2F2A20" />
            <Circle cx={5.8} cy={-8.2} r={1} fill="#FFF" />
          </>
        ) : (
          <>
            <Circle cx={-7} cy={-7} r={2.8} fill="#2F2A20" />
            <Circle cx={7} cy={-7} r={2.8} fill="#2F2A20" />
          </>
        )}
        <Ellipse
          cx={0}
          cy={2}
          rx={body.headRadius * 0.14}
          ry={body.headRadius * 0.1}
          fill="#2F2A20"
        />
        <G transform="translate(0 5) scale(.85)">
          <Path
            d={face.mouthPath}
            stroke="#2F2A20"
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
        </G>
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
