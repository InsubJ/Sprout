import Svg, { Ellipse, G, Path } from "react-native-svg";
import {
  computeGlimmerSparkles,
  computeTreeBranches,
  computeTreeTrunk,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GlimmerSparkles } from "../shared/GlimmerSparkles";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function GoldenOakPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const { topY } = computeTreeTrunk(growth.growthPercent, 40, 1.1);
  const branches = computeTreeBranches(growth.growthPercent, growth.asymmetry, topY, {
    maxBranches: 7,
    branchDensity: 15,
    spreadBase: 34,
    spreadStep: 10,
  });
  const sparkles = computeGlimmerSparkles(growth.growthPercent, topY);
  const trunk = growth.isWithered ? "#8F8168" : "#5C4530";
  const leaf = growth.isWithered ? "#A89478" : "#D4A83D";
  const light = growth.isWithered ? "#BDAB90" : "#E8C468";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Golden oak at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#F5D97A" />
      ) : null}
      <GroundShadow rx={100} />
      <PlantPot color="#6B5232" colorLight="#83643E" colorDark="#4A3A22" halfWidth={55} />
      <Path d={`M200 300 L200 ${topY}`} stroke={trunk} strokeWidth="18" strokeLinecap="round" />
      <Path
        d={`M200 300 L200 ${topY}`}
        stroke={growth.isWithered ? "#A79980" : "#7A5F3D"}
        strokeWidth="7"
        strokeLinecap="round"
        opacity={0.5}
      />
      {branches.map((item, index) => (
        <G key={index}>
          <Path
            d={item.path}
            stroke={trunk}
            strokeWidth={growth.isWithered ? 5 : 9}
            fill="none"
            strokeLinecap="round"
          />
          <Ellipse
            cx={item.leafX}
            cy={item.leafY}
            rx={growth.isWithered ? 15 : 22}
            ry={growth.isWithered ? 10 : 15}
            fill={leaf}
            opacity={growth.isWithered ? 0.6 : 1}
          />
        </G>
      ))}
      {growth.growthPercent >= 15 ? (
        <Ellipse
          cx="200"
          cy={topY - 15}
          rx={growth.isWithered ? 22 : 38}
          ry={growth.isWithered ? 14 : 22}
          fill={light}
          opacity={growth.isWithered ? 0.6 : 1}
        />
      ) : null}
      {!growth.isWithered && growth.growthPercent >= 15 ? (
        <GlimmerSparkles sparkles={sparkles} />
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 168, cy: 296, rx: 7, ry: 5 },
            { cx: 238, cy: 298, rx: 7, ry: 5 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
