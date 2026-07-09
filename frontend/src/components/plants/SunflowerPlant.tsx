import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeSunflowerStem } from "../../utils/plantGeometry/sunflowerGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * SunflowerPlant — uncommon tier, daily-frequency moderate wither tolerance
 * per the difficulty table. Render-only; all math lives in
 * usePlantGrowth / sunflowerGeometry.
 *
 *   <SunflowerPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function SunflowerPlant({
  currentWaterings = 0,
  targetWaterings = 30,
  witherCount = 0,
  status = "healthy",
  size = 260,
}: PlantProps) {
  const { growthPercent, isWithered, isCompleted, finalVariant } = usePlantGrowth({
    currentWaterings,
    targetWaterings,
    witherCount,
    status,
  });

  const { stemPath, headX, headY, headRadius, petalCount, leafPositions } =
    computeSunflowerStem(growthPercent);

  const stemColor = isWithered ? "#A9A37E" : "#4E7D3A";
  const petalColor = isWithered ? "#C9BE8A" : "#F2C230";
  const discColor = isWithered ? "#8A7A5A" : "#7A5230";
  const showAura = isCompleted && finalVariant === "flawless";
  const showScars = isCompleted && finalVariant === "scarred";

  const petals = Array.from({ length: petalCount }, (_, i) => {
    const angle = (i / petalCount) * Math.PI * 2;
    return {
      cx: headX + Math.cos(angle) * headRadius * 1.6,
      cy: headY + Math.sin(angle) * headRadius * 1.6,
      rotation: (angle * 180) / Math.PI,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Sunflower at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura color="#F2C230" />}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      <path d={stemPath} stroke={stemColor} strokeWidth="6" strokeLinecap="round" fill="none" />

      {leafPositions.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x + leaf.side * 22}
          cy={leaf.y}
          rx="16"
          ry="9"
          fill={stemColor}
          opacity={isWithered ? 0.6 : 0.9}
          transform={`rotate(${leaf.side * 20} ${leaf.x} ${leaf.y})`}
        />
      ))}

      {headRadius > 10 && (
        <g opacity={isWithered ? 0.6 : 1}>
          {petals.map((p, i) => (
            <ellipse
              key={i}
              cx={p.cx}
              cy={p.cy}
              rx={headRadius * 0.55}
              ry={headRadius * 0.28}
              fill={petalColor}
              transform={`rotate(${p.rotation} ${p.cx} ${p.cy})`}
            />
          ))}
          <circle cx={headX} cy={headY} r={headRadius} fill={discColor} />
        </g>
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 180, cy: 296, rx: 6, ry: 4 },
            { cx: 222, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      )}
    </svg>
  );
}
