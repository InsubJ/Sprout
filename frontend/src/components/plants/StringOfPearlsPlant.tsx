import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeVines } from "../../utils/plantGeometry/vineGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * StringOfPearlsPlant — Senecio rowleyanus. Render-only; reuses
 * computeVines unmodified (same trailing-vine math as pothos) but
 * renders small round beads along each strand instead of leaf ellipses,
 * with more, denser points per strand for the "string of pearls" look.
 *
 *   <StringOfPearlsPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function StringOfPearlsPlant({
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

    const vines = computeVines(growthPercent, asymmetry, {
        maxStrands: 5,
        strandDensity: 20,
        pointCount: 6,
        lengthBase: 35,
        lengthMultiplier: 1.0,
    });

    const strandColor = isWithered ? "#9CA37C" : "#5E9A5B";
    const pearlColor = isWithered ? "#B0B491" : "#7FBF74";
    const pearlHighlight = isWithered ? "#C9CDAE" : "#A8DE9E";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`String of pearls at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#7FBF74" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {vines.map((vine, i) => (
                <g key={i}>
                    <path d={vine.path} stroke={strandColor} strokeWidth="1.5" fill="none" opacity="0.7" />
                    {vine.points.map((pearl, j) => (
                        <g key={j}>
                            <circle
                                cx={pearl.x}
                                cy={pearl.y}
                                r={isWithered ? 4 : 6}
                                fill={pearlColor}
                                opacity={isWithered ? 0.6 : 1}
                            />
                            <circle cx={pearl.x - 1.5} cy={pearl.y - 1.5} r="1.5" fill={pearlHighlight} opacity="0.8" />
                        </g>
                    ))}
                </g>
            ))}

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