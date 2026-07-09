import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computePothosVines } from "../../utils/plantGeometry/pothosGeometry";
import PlantStool from "./shared/PlantStool";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import Blossoms from "./shared/Blossoms";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * PothosPlant — common tier, forgiving wither threshold per the difficulty
 * table. Render-only; all math lives in usePlantGrowth / pothosGeometry.
 *
 *   <PothosPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function PothosPlant({
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

  const vines = computePothosVines(growthPercent, asymmetry);

  const vineColor = isWithered ? "#8FA378" : "#3F7D3A";
  const leafColor = isWithered ? "#A9B991" : "#4E9648";
  const leafColorAccent = isWithered ? "#C4CBAE" : "#8FC65C";
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Pothos at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      <GroundShadow />
      <PlantStool />

      <g transform="translate(0, -100)">
        {showAura && <FlawlessAura />}
        <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

        {vines.map((vine, i) => (
          <g key={i}>
            <path
              d={vine.path}
              stroke={vineColor}
              strokeWidth={isWithered ? 2 : 3}
              fill="none"
              strokeLinecap="round"
            />
            {vine.leaves.map((leaf, j) => (
              <ellipse
                key={j}
                cx={leaf.x}
                cy={leaf.y}
                rx={isWithered ? 8 : 12}
                ry={isWithered ? 5 : 8}
                fill={j % 2 === 0 ? leafColor : leafColorAccent}
                opacity={isWithered ? 0.6 : 1}
                transform={`rotate(${leaf.rotation} ${leaf.x} ${leaf.y})`}
              />
            ))}
          </g>
        ))}

        {showAura && (
          <Blossoms
            positions={[
              { cx: 150, cy: 200, r: 3.5 },
              { cx: 250, cy: 205, r: 3.5 },
              { cx: 200, cy: 190, r: 3.5 },
            ]}
          />
        )}

        {showScars && (
          <ScarredAccents
            marks={[
              { cx: 175, cy: 296, rx: 6, ry: 4 },
              { cx: 228, cy: 298, rx: 6, ry: 4 },
            ]}
          />
        )}
      </g>
    </svg>
  );
}
