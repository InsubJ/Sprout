import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import {
  computeCactusBody,
  computeCactusArms,
  computeCactusSpineRows,
} from "../../utils/plantGeometry/cactusGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * DesertCactusPlant — rendering only. All growth math lives in
 * usePlantGrowth / computeCactusBody / computeCactusArms / computeCactusSpineRows.
 *
 *   <DesertCactusPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function DesertCactusPlant({
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

  const { bodyHeight, bodyTopY } = computeCactusBody(growthPercent);
  const arms = computeCactusArms(growthPercent, asymmetry, bodyTopY);
  const spineRows = computeCactusSpineRows(bodyHeight, bodyTopY);

  const bodyColor = isWithered
    ? "#9CA37C"
    : witherCount >= 4
      ? "#7C9A5E"
      : witherCount >= 2
        ? "#5E9A5B"
        : "#3F8F52";

  const bodyHighlight = isWithered ? "#B0B491" : "#5CAE6E";
  const spineColor = isWithered ? "#D8D2B8" : "#F4EAD1";
  const showAura = isCompleted && finalVariant === "flawless";
  const showBloom = growthPercent >= 90;
  const showScars = isCompleted && finalVariant === "scarred";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Desert cactus at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
        }`}
    >
      {showAura && <FlawlessAura />}
      <GroundShadow rx={90} />
      <PlantPot color="#B0563A" colorLight="#C46A4C" colorDark="#8C4531" halfWidth={45} />
      <ellipse cx="200" cy="298" rx="48" ry="5" fill="#E8D3A6" />

      {arms.map((arm, i) => (
        <g key={i}>
          <path d={arm.path} stroke={bodyColor} strokeWidth="16" strokeLinecap="round" fill="none" />
          <path
            d={arm.highlightPath}
            stroke={bodyHighlight}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </g>
      ))}

      <path
        d={`M182 300
            Q178 ${bodyTopY + bodyHeight * 0.5} 185 ${bodyTopY + 20}
            Q195 ${bodyTopY} 200 ${bodyTopY}
            Q205 ${bodyTopY} 215 ${bodyTopY + 20}
            Q222 ${bodyTopY + bodyHeight * 0.5} 218 300 Z`}
        fill={bodyColor}
      />
      <path
        d={`M188 300 Q185 ${bodyTopY + bodyHeight * 0.5} 190 ${bodyTopY + 25}`}
        stroke={bodyHighlight}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <line x1="200" y1={bodyTopY + 5} x2="200" y2="298" stroke="#2E6B3E" strokeWidth="2" opacity="0.4" />

      {spineRows.map((row, i) => (
        <g key={i}>
          <line x1="182" y1={row.y} x2="176" y2={row.y - 4} stroke={spineColor} strokeWidth="2" />
          <line x1="218" y1={row.y} x2="224" y2={row.y - 4} stroke={spineColor} strokeWidth="2" />
        </g>
      ))}

      {showBloom && (
        <g>
          <circle cx="200" cy={bodyTopY - 6} r={isWithered ? 5 : 10} fill={isWithered ? "#C4A08A" : "#EAA89B"} />
          <circle cx="200" cy={bodyTopY - 6} r={isWithered ? 2 : 4} fill="#FCE4CB" />
        </g>
      )}

      {showScars && (
        <ScarredAccents
          marks={[
            { cx: 188, cy: 260, rx: 5, ry: 8 },
            { cx: 212, cy: 230, rx: 4, ry: 6 },
          ]}
        />
      )}
    </svg>
  );
}
