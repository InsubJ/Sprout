import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRadialLeaves } from "../../utils/plantGeometry/radialLeafGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * MarantaPlant — Maranta leuconeura (Prayer Plant). Render-only; reuses
 * computeRadialLeaves with a wide, low fan (its leaves spread flat by
 * day) and draws broad patterned ovals at each tip rather than thin
 * blades, plus a dark feather marking down each leaf's spine.
 *
 *   <MarantaPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function MarantaPlant({
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

    // Withered maranta leaves fold upward (its signature "praying" motion
    // under stress) rather than drooping — a wider, flatter spread when
    // healthy, folding narrower when withered.
    const leaves = computeRadialLeaves(growthPercent, asymmetry, {
        leafCountBase: 2,
        leafDensity: 14,
        maxLeaves: 7,
        angleSpreadDeg: isWithered ? 70 : 170,
        lengthBase: 40,
        lengthMultiplier: 0.55,
    });

    const leafColor = isWithered ? "#8FA37E" : "#3B6B3F";
    const markingColor = isWithered ? "#6B7A5E" : "#1F4423";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Maranta leuconeura at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#C97B9E" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {leaves.map((leaf, i) => (
                <g key={i}>
                    <path d={leaf.path} stroke={leafColor} strokeWidth="2" fill="none" opacity="0.7" />
                    <ellipse
                        cx={leaf.tipX}
                        cy={leaf.tipY}
                        rx={isWithered ? 12 : 18}
                        ry={isWithered ? 8 : 11}
                        fill={leafColor}
                        opacity={isWithered ? 0.6 : 1}
                        transform={`rotate(${leaf.rotationDeg} ${leaf.tipX} ${leaf.tipY})`}
                    />
                    <ellipse
                        cx={leaf.tipX}
                        cy={leaf.tipY}
                        rx={isWithered ? 6 : 9}
                        ry={isWithered ? 3 : 4.5}
                        fill={markingColor}
                        opacity={isWithered ? 0.5 : 0.8}
                        transform={`rotate(${leaf.rotationDeg} ${leaf.tipX} ${leaf.tipY})`}
                    />
                </g>
            ))}

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