import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeStalks } from "../../utils/plantGeometry/stalkGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * BegoniaMaculataPlant — Begonia Maculata (Polka Dot Begonia). Render-only;
 * reuses computeStalks with fewer, thicker canes and leaf attachment
 * points along each cane for the large angel-wing leaves, drawn with a
 * white polka-dot pattern.
 *
 *   <BegoniaMaculataPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function BegoniaMaculataPlant({
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

    const canes = computeStalks(growthPercent, asymmetry, {
        maxStalks: 3,
        stalkDensity: 30,
        heightBase: 35,
        heightMultiplier: 1.15,
        topClusterSize: 0,
        leafAttachmentsPerStalk: 3,
    });

    const caneColor = isWithered ? "#8A8574" : "#3F5A2F";
    const leafColor = isWithered ? "#8FA37E" : "#2F5A3B";
    const leafUnderside = isWithered ? "#A69488" : "#7A2E3A";
    const spotColor = isWithered ? "#C4C4B0" : "#EDEDE0";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Begonia Maculata at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#7A2E3A" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {canes.map((cane, i) => (
                <g key={i}>
                    <path d={cane.path} stroke={caneColor} strokeWidth="4" strokeLinecap="round" fill="none" />
                    {cane.leafAttachments.map((leaf, j) => (
                        <g key={j}>
                            <ellipse
                                cx={leaf.x + leaf.side * 20}
                                cy={leaf.y}
                                rx={isWithered ? 12 : 18}
                                ry={isWithered ? 7 : 10}
                                fill={leafColor}
                                opacity={isWithered ? 0.6 : 1}
                                transform={`rotate(${leaf.side * 15} ${leaf.x} ${leaf.y})`}
                            />
                            {!isWithered &&
                                [0, 1, 2].map((s) => (
                                    <circle
                                        key={s}
                                        cx={leaf.x + leaf.side * (14 + s * 6)}
                                        cy={leaf.y - 2 + (s % 2) * 4}
                                        r="1.6"
                                        fill={spotColor}
                                    />
                                ))}
                        </g>
                    ))}
                </g>
            ))}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 181, cy: 296, rx: 6, ry: 4 },
                        { cx: 219, cy: 298, rx: 6, ry: 4 },
                    ]}
                />
            )}
        </svg>
    );
}