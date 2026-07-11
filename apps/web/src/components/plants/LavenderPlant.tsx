import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeLavenderStalks } from "../../utils/plantGeometry/lavenderGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import Blossoms from "./shared/Blossoms";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * LavenderPlant — uncommon tier, daily-frequency moderate wither tolerance
 * per the difficulty table. Render-only; all math lives in
 * usePlantGrowth / lavenderGeometry.
 *
 *   <LavenderPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function LavenderPlant({
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

  const stalks = computeLavenderStalks(growthPercent, asymmetry);

  const stalkColor = isWithered ? "#A9A38F" : "#5E7D4A";
  const budColor = isWithered ? "#B7A6C4" : "#7B5EA7";
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Lavender at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura color="#B79BD6" />}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      {stalks.map((stalk, i) => (
        <g key={i}>
          <path d={stalk.path} stroke={stalkColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          {stalk.buds.map((bud, j) => (
            <circle
              key={j}
              cx={bud.x}
              cy={bud.y}
              r={isWithered ? 2.5 : 3.5}
              fill={budColor}
              opacity={isWithered ? 0.6 : 1}
            />
          ))}
        </g>
      ))}

      {showAura && (
        <Blossoms
          color="#B79BD6"
          positions={[
            { cx: 150, cy: 130, r: 3.5 },
            { cx: 250, cy: 135, r: 3.5 },
            { cx: 200, cy: 110, r: 3.5 },
          ]}
        />
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 176, cy: 296, rx: 6, ry: 4 },
            { cx: 226, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
