import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeSpiderLeaves, computeSpiderPups } from "../../utils/plantGeometry/spiderPlantGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * SpiderPlant — common tier, forgiving wither threshold per the difficulty
 * table. Render-only; all math lives in usePlantGrowth / spiderPlantGeometry.
 *
 *   <SpiderPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function SpiderPlant({
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

  const leaves = computeSpiderLeaves(growthPercent, asymmetry);
  const pups = computeSpiderPups(growthPercent);

  const leafColor = isWithered ? "#A9B991" : "#4E9648";
  const pupColor = isWithered ? "#B9C6A5" : "#6FB35F";
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Spider plant at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura />}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      {leaves.map((leaf, i) => (
        <path
          key={i}
          d={leaf.path}
          stroke={leafColor}
          strokeWidth={isWithered ? 4 : 6}
          fill="none"
          strokeLinecap="round"
          opacity={isWithered ? 0.6 : 1}
        />
      ))}

      {pups.map((pup, i) => (
        <g key={i}>
          <line x1="200" y1="280" x2={pup.cx} y2={pup.cy + 10} stroke={leafColor} strokeWidth="2" opacity="0.6" />
          <circle cx={pup.cx} cy={pup.cy} r={isWithered ? 6 : 9} fill={pupColor} opacity={isWithered ? 0.6 : 1} />
        </g>
      ))}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 178, cy: 296, rx: 6, ry: 4 },
            { cx: 224, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
