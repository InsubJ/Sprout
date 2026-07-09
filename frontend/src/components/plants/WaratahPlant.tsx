import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRadialBloom } from "../../utils/radialBloomGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * WaratahPlant — Telopea (Waratah). Render-only; reuses
 * computeRadialBloom with a woody stem, fewer/longer pointed bracts,
 * and a domed crimson flower head instead of sunflower's flat petals.
 *
 *   <WaratahPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function WaratahPlant({
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

    const { stemPath, headX, headY, headRadius, petals, leafPositions } = computeRadialBloom(
        growthPercent,
        {
            heightBase: 45,
            heightMultiplier: 1.2,
            headRadiusBase: 8,
            headRadiusMultiplier: 0.22,
            petalCount: 9,
            petalReach: 1.15,
            leafHeightFractions: [0.35, 0.55, 0.75],
        }
    );

    const stemColor = isWithered ? "#9C9377" : "#5C6B3F";
    const bractColor = isWithered ? "#C9A2A0" : "#B31B34";
    const domeColor = isWithered ? "#8A7A6F" : "#7A0E20";
    const leafColor = isWithered ? "#A9A98F" : "#3F6B3F";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Waratah at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#B31B34" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            <path d={stemPath} stroke={stemColor} strokeWidth="7" strokeLinecap="round" fill="none" />

            {leafPositions.map((leaf, i) => (
                <path
                    key={i}
                    d={`M${leaf.x} ${leaf.y} L${leaf.x + leaf.side * 26} ${leaf.y - 8}`}
                    stroke={leafColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity={isWithered ? 0.6 : 0.9}
                />
            ))}

            {headRadius > 8 && (
                <g opacity={isWithered ? 0.6 : 1}>
                    {petals.map((p, i) => (
                        <path
                            key={i}
                            d={`M${headX} ${headY} L${p.cx} ${p.cy}`}
                            stroke={bractColor}
                            strokeWidth={headRadius * 0.22}
                            strokeLinecap="round"
                        />
                    ))}
                    <circle cx={headX} cy={headY} r={headRadius * 0.6} fill={domeColor} />
                </g>
            )}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 177, cy: 296, rx: 6, ry: 4 },
                        { cx: 225, cy: 298, rx: 6, ry: 4 },
                    ]}
                />
            )}
        </svg>
    );
}