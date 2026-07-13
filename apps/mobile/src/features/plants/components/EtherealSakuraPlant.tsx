import Svg, { Ellipse, G, Path } from "react-native-svg";
import {
  computeFloatingPetals,
  computeGlimmerSparkles,
  computeTreeBranches,
  computeTreeTrunk,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { Blossoms } from "../shared/Blossoms";
import { FlawlessAura } from "../shared/FlawlessAura";
import { FloatingPetals } from "../shared/FloatingPetals";
import { GlimmerSparkles } from "../shared/GlimmerSparkles";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function EtherealSakuraPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const { topY } = computeTreeTrunk(growth.growthPercent, 35, 1);
  const branches = computeTreeBranches(growth.growthPercent, growth.asymmetry, topY, {
    maxBranches: 6,
    branchDensity: 16,
    spreadBase: 26,
    spreadStep: 8,
  });
  const sparkles = computeGlimmerSparkles(growth.growthPercent, topY);
  const petals = computeFloatingPetals(growth.growthPercent, topY);
  const trunk = growth.isWithered ? "#786E65" : "#A69282";
  const blossom = growth.isWithered ? "#9C867F" : "#FF5E97";
  const light = growth.isWithered ? "#BDAB9A" : "#FFB3D1";
  const aura = growth.isCompleted && growth.finalVariant === "flawless";
  const effects = !growth.isWithered && growth.growthPercent >= 15;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Ethereal sakura at ${Math.round(growth.growthPercent)}% growth`}
    >
      {aura ? <FlawlessAura color="#F5D97A" /> : null}
      <GroundShadow />
      <PlantPot color="#E8E1D6" colorLight="#F4EFE6" colorDark="#C9BEA9" />
      <Path d={`M200 300 L200 ${topY}`} stroke={trunk} strokeWidth="12" strokeLinecap="round" />
      <Path
        d={`M200 300 L200 ${topY}`}
        stroke={growth.isWithered ? "#B6ABA0" : "#F0E9DE"}
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0.5}
      />
      {branches.map((item, index) => (
        <G key={index}>
          <Path
            d={item.path}
            stroke={trunk}
            strokeWidth={growth.isWithered ? 3 : 5}
            fill="none"
            strokeLinecap="round"
          />
          <Ellipse
            cx={item.leafX}
            cy={item.leafY}
            rx={growth.isWithered ? 11 : 16}
            ry={growth.isWithered ? 7 : 11}
            fill={blossom}
            opacity={growth.isWithered ? 0.6 : 1}
          />
        </G>
      ))}
      {growth.growthPercent >= 15 ? (
        <Ellipse
          cx="200"
          cy={topY - 15}
          rx={growth.isWithered ? 16 : 28}
          ry={growth.isWithered ? 10 : 17}
          fill={light}
          opacity={growth.isWithered ? 0.6 : 1}
        />
      ) : null}
      {effects ? <FloatingPetals petals={petals} /> : null}
      {effects ? <GlimmerSparkles sparkles={sparkles} /> : null}
      {aura ? (
        <Blossoms
          color="#F5D97A"
          positions={[
            { cx: 150, cy: 85, r: 4 },
            { cx: 248, cy: 95, r: 4 },
            { cx: 200, cy: 65, r: 4 },
            { cx: 118, cy: 145, r: 3.5 },
            { cx: 282, cy: 150, r: 3.5 },
          ]}
        />
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 172, cy: 296, rx: 5, ry: 4 },
            { cx: 232, cy: 298, rx: 5, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
