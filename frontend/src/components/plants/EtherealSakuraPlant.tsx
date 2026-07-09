import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeTreeTrunk, computeTreeBranches } from "../../utils/plantGeometry/treeGeometry";
import { computeGlimmerSparkles } from "../../utils/mythicalGlimmer";
import { computeFloatingPetals } from "../../utils/plantGeometry/sakuraGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import Blossoms from "./shared/Blossoms";
import ScarredAccents from "./shared/ScarredAccents";
import GlimmerSparkles from "./shared/GlimmerSparkles";
import FloatingPetals from "./shared/FloatingPetals";

/**
 * EtherealSakuraPlant — mythical tier, zero-tolerance wither schedule
 * per the difficulty table. Render-only; all math lives in
 * usePlantGrowth / treeGeometry / mythicalGlimmer / sakuraGeometry.
 *
 *   <EtherealSakuraPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function EtherealSakuraPlant({
  currentWaterings = 0,
  targetWaterings = 30,
  witherCount = 0,
  status = "healthy",
  size = 260,
}: PlantProps) {
  const { growthPercent, isWithered, isCompleted, finalVariant, asymmetry } = usePlantGrowth({
    currentWaterings,
    targetWaterings,
    witherCount,
    status,
  });

  // Sakura is taller and more delicately branched than bonsai.
  const { topY } = computeTreeTrunk(growthPercent, 35, 1.0);
  const branches = computeTreeBranches(growthPercent, asymmetry, topY, {
    maxBranches: 6,
    branchDensity: 16,
    spreadBase: 26,
    spreadStep: 8,
  });

  const sparkles = computeGlimmerSparkles(growthPercent, topY);
  const petals = computeFloatingPetals(growthPercent, topY);

  const trunkColor = isWithered ? "#786E65" : "#A69282";
  const blossomColor = isWithered ? "#9C867F" : "#FF5E97";
  const blossomColorLight = isWithered ? "#BDAB9A" : "#FFB3D1";
  const showCrown = growthPercent >= 15;
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";
  // Sparkle/petal drift only reads as "mythical" once the tree has real growth,
  // and never on a currently-withered plant.
  const showMythicalEffects = !isWithered && growthPercent >= 15;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Ethereal sakura at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura color="#F5D97A" />}
      <GroundShadow />
      <PlantPot color="#E8E1D6" colorLight="#F4EFE6" colorDark="#C9BEA9" />

      <path
        d={`M200 300 L200 ${topY}`}
        stroke={trunkColor}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M200 300 L200 ${topY}`}
        stroke={isWithered ? "#B6ABA0" : "#F0E9DE"}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {branches.map((branch, i) => (
        <g key={i}>
          <path
            d={branch.path}
            stroke={trunkColor}
            strokeWidth={isWithered ? 3 : 5}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx={branch.leafX}
            cy={branch.leafY}
            rx={isWithered ? 11 : 16}
            ry={isWithered ? 7 : 11}
            fill={blossomColor}
            opacity={isWithered ? 0.6 : 1}
          />
        </g>
      ))}

      {showCrown && (
        <ellipse
          cx="200"
          cy={topY - 15}
          rx={isWithered ? 16 : 28}
          ry={isWithered ? 10 : 17}
          fill={blossomColorLight}
          opacity={isWithered ? 0.6 : 1}
        />
      )}

      {showMythicalEffects && <FloatingPetals petals={petals} />}
      {showMythicalEffects && <GlimmerSparkles sparkles={sparkles} />}

      {showAura && (
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
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 172, cy: 296, rx: 5, ry: 4 },
            { cx: 232, cy: 298, rx: 5, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
