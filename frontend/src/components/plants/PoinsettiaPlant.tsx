import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRadialBloom } from "../../utils/plantGeometry/radialBloomGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * PoinsettiaPlant — render-only; reuses computeRadialBloom with long
 * pointed bracts fanned flat (the iconic "star" silhouette) and small
 * yellow cyathia at center instead of a solid disc.
 *
 *   <PoinsettiaPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function PoinsettiaPlant({
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
            heightBase: 35,
            heightMultiplier: 1.15,
            headRadiusBase: 6,
            headRadiusMultiplier: 0.24,
            petalCount: 8,
            petalReach: 1.5,
            leafHeightFractions: [0.3, 0.5, 0.7, 0.85],
        }
    );

    const stemColor = isWithered ? "#9C9377" : "#3F6B3F";
    const bractColor = isWithered ? "#C9A2A0" : "#C41E2C";
    const cyathiaColor = isWithered ? "#C4B98A" : "#F2D230";
    const leafColor = isWithered ? "#A9A98F" : "#2F5A2F";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Poinsettia at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#C41E2C" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            <path d={stemPath} stroke={stemColor} strokeWidth="5" strokeLinecap="round" fill="none" />

            {leafPositions.map((leaf, i) => (
                <ellipse
                    key={i}
                    cx={leaf.x + leaf.side * 20}
                    cy={leaf.y}
                    rx="15"
                    ry="7"
                    fill={leafColor}
                    opacity={isWithered ? 0.6 : 0.9}
                    transform={`rotate(${leaf.side * 20} ${leaf.x} ${leaf.y})`}
                />
            ))}

            {headRadius > 6 && (
                <g opacity={isWithered ? 0.6 : 1}>
                    {petals.map((p, i) => (
                        <path
                            key={i}
                            d={`M${headX} ${headY} 
                  L${headX + (p.cx - headX) * 0.3} ${headY + (p.cy - headY) * 0.3 - 3}
                  L${p.cx} ${p.cy}
                  L${headX + (p.cx - headX) * 0.3} ${headY + (p.cy - headY) * 0.3 + 3}
                  Z`}
                            fill={bractColor}
                        />
                    ))}
                    {[0, 1, 2, 3].map((c) => (
                        <circle
                            key={c}
                            cx={headX + (c % 2 === 0 ? -1 : 1) * 3}
                            cy={headY + (c < 2 ? -1 : 1) * 3}
                            r="2"
                            fill={cyathiaColor}
                        />
                    ))}
                </g>
            )}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 180, cy: 296, rx: 6, ry: 4 },
                        { cx: 220, cy: 298, rx: 6, ry: 4 },
                    ]}
                />
            )}
        </svg>
    );
}