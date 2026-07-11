import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeTreeTrunk, computeTreeBranches } from "../../utils/plantGeometry/treeGeometry";
import { computeGlimmerSparkles } from "../../utils/mythicalGlimmer";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";
import GlimmerSparkles from "./shared/GlimmerSparkles";

/**
 * GoldenOakPlant — mythical tier, zero-tolerance wither schedule per the
 * difficulty table. Foliage is gold leaves (not blossoms), so this reuses
 * computeGlimmerSparkles unmodified but deliberately skips FloatingPetals —
 * that stays sakura-specific.
 *
 *   <GoldenOakPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function GoldenOakPlant({
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

    // Oak is broader and sturdier than bonsai or sakura: thicker trunk,
    // wider canopy spread, fewer but heavier branches.
    const { topY } = computeTreeTrunk(growthPercent, 40, 1.1);
    const branches = computeTreeBranches(growthPercent, asymmetry, topY, {
        maxBranches: 7,
        branchDensity: 15,
        spreadBase: 34,
        spreadStep: 10,
    });

    const sparkles = computeGlimmerSparkles(growthPercent, topY);

    const trunkColor = isWithered ? "#8F8168" : "#5C4530";
    const leafColor = isWithered ? "#A89478" : "#D4A83D";
    const leafColorLight = isWithered ? "#BDAB90" : "#E8C468";
    const showCrown = growthPercent >= 15;
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";
    const showShimmer = !isWithered && growthPercent >= 15;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Golden oak at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#F5D97A" />}
            <GroundShadow rx={100} />
            <PlantPot color="#6B5232" colorLight="#83643E" colorDark="#4A3A22" halfWidth={55} />

            <path
                d={`M200 300 L200 ${topY}`}
                stroke={trunkColor}
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d={`M200 300 L200 ${topY}`}
                stroke={isWithered ? "#A79980" : "#7A5F3D"}
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
            />

            {branches.map((branch, i) => (
                <g key={i}>
                    <path
                        d={branch.path}
                        stroke={trunkColor}
                        strokeWidth={isWithered ? 5 : 9}
                        fill="none"
                        strokeLinecap="round"
                    />
                    <ellipse
                        cx={branch.leafX}
                        cy={branch.leafY}
                        rx={isWithered ? 15 : 22}
                        ry={isWithered ? 10 : 15}
                        fill={leafColor}
                        opacity={isWithered ? 0.6 : 1}
                    />
                </g>
            ))}

            {showCrown && (
                <ellipse
                    cx="200"
                    cy={topY - 15}
                    rx={isWithered ? 22 : 38}
                    ry={isWithered ? 14 : 22}
                    fill={leafColorLight}
                    opacity={isWithered ? 0.6 : 1}
                />
            )}

            {showShimmer && <GlimmerSparkles sparkles={sparkles} />}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 168, cy: 296, rx: 7, ry: 5 },
                        { cx: 238, cy: 298, rx: 7, ry: 5 },
                    ]}
                />
            )}
        </svg>
    );
}