import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeTreeTrunk, computeTreeBranches } from "../../utils/plantGeometry/treeGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import Blossoms from "./shared/Blossoms";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * BonsaiPlant — rendering only. All growth math lives in
 * usePlantGrowth / computeBonsaiTrunk / computeBonsaiBranches.
 *
 *   <BonsaiPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function BonsaiPlant({
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

  const { topY } = computeTreeTrunk(growthPercent);
  const branches = computeTreeBranches(growthPercent, asymmetry, topY);

  const leafColor = isWithered
    ? "#A99A6B"
    : witherCount >= 4
      ? "#B79A5E"
      : witherCount >= 2
        ? "#5F8A2E"
        : "#3B6D11";

  const leafColorLight = isWithered
    ? "#C4B685"
    : witherCount >= 4
      ? "#C9AE72"
      : witherCount >= 2
        ? "#79A63F"
        : "#4E8A18";

  const trunkColor = isWithered ? "#8A7357" : "#6B4A2F";
  const showCrown = growthPercent >= 15;
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Bonsai at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura />}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      <path
        d={`M200 300 L200 ${topY}`}
        stroke={trunkColor}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M200 300 L200 ${topY}`}
        stroke={isWithered ? "#B0A181" : "#7A5638"}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {branches.map((branch, i) => (
        <g key={i}>
          <path
            d={branch.path}
            stroke={trunkColor}
            strokeWidth={isWithered ? 4 : 7}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx={branch.leafX}
            cy={branch.leafY}
            rx={isWithered ? 12 : 18}
            ry={isWithered ? 8 : 12}
            fill={leafColor}
            opacity={isWithered ? 0.6 : 1}
          />
        </g>
      ))}

      {showCrown && (
        <ellipse
          cx="200"
          cy={topY - 15}
          rx={isWithered ? 18 : 30}
          ry={isWithered ? 12 : 18}
          fill={leafColorLight}
          opacity={isWithered ? 0.6 : 1}
        />
      )}

      {showAura && (
        <Blossoms
          positions={[
            { cx: 150, cy: 90, r: 4 },
            { cx: 245, cy: 100, r: 4 },
            { cx: 200, cy: 70, r: 4 },
            { cx: 120, cy: 150, r: 3.5 },
            { cx: 280, cy: 155, r: 3.5 },
          ]}
        />
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 170, cy: 295, rx: 6, ry: 4 },
            { cx: 235, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
