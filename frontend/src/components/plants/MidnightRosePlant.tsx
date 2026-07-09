import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRoseStem } from "../../utils/plantGeometry/roseGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * MidnightRosePlant — rare tier, low wither tolerance per the difficulty
 * table. Render-only; all math lives in usePlantGrowth / roseGeometry.
 *
 *   <MidnightRosePlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function MidnightRosePlant({
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

  const { stemPath, thorns, bloomX, bloomY, bloomRadius } = computeRoseStem(
    growthPercent,
    asymmetry
  );

  const stemColor = isWithered ? "#8A8574" : "#2F4A2F";
  const thornColor = isWithered ? "#8A8574" : "#1E331E";
  const bloomColor = isWithered ? "#8A6A70" : "#3B0F1F";
  const bloomHighlight = isWithered ? "#A18389" : "#5C1830";
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Midnight rose at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura color="#5C1830" />}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      <path d={stemPath} stroke={stemColor} strokeWidth="5" strokeLinecap="round" fill="none" />

      {thorns.map((thorn, i) => (
        <line
          key={i}
          x1={thorn.x}
          y1={thorn.y}
          x2={thorn.x + Math.sign(thorn.angleDeg) * 8}
          y2={thorn.y - 4}
          stroke={thornColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {bloomRadius > 8 && (
        <g opacity={isWithered ? 0.65 : 1}>
          <circle cx={bloomX} cy={bloomY} r={bloomRadius} fill={bloomColor} />
          <circle cx={bloomX} cy={bloomY} r={bloomRadius * 0.6} fill={bloomHighlight} />
          <circle cx={bloomX} cy={bloomY} r={bloomRadius * 0.25} fill={bloomColor} />
        </g>
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 182, cy: 296, rx: 6, ry: 4 },
            { cx: 220, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
