import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRadialBloom, computeBloomPetals, RadialBloomPetal } from "../../utils/plantGeometry/radialBloomGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * buildBractPath
 *
 * Pure path builder for a single star-bract: a curved, pointed leaf
 * shape (not a thin straight-edged diamond) that bulges outward on
 * each side before tapering to the tip. Width scales with headRadius
 * so bracts thicken proportionally as the bloom grows.
 *
 * Local to this component since only poinsettia currently wants this
 * exact bract silhouette — not yet promoted to a shared utility.
 */
function buildBractPath(centerX: number, centerY: number, petal: RadialBloomPetal, width: number): string {
    const dx = petal.cx - centerX;
    const dy = petal.cy - centerY;
    const length = Math.hypot(dx, dy) || 1;
    const px = -dy / length;
    const py = dx / length;

    const beltT = 0.42;
    const beltX = centerX + dx * beltT;
    const beltY = centerY + dy * beltT;
    const leftX = beltX + px * width;
    const leftY = beltY + py * width;
    const rightX = beltX - px * width;
    const rightY = beltY - py * width;

    return `M${centerX} ${centerY} Q${leftX} ${leftY} ${petal.cx} ${petal.cy} Q${rightX} ${rightY} ${centerX} ${centerY} Z`;
}

/**
 * PoinsettiaPlant — render-only; reuses computeRadialBloom for the main
 * bloom cluster and computeBloomPetals for two smaller satellite
 * clusters, so the plant reads as several bract rosettes grouped atop
 * the stem rather than a single flower.
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

    const { stemPath, headX, headY, headRadius, leafPositions } = computeRadialBloom(growthPercent, {
        heightBase: 35,
        heightMultiplier: 1.15,
        headRadiusBase: 6,
        headRadiusMultiplier: 0.24,
        petalCount: 8,
        petalReach: 1.5,
        leafHeightFractions: [0.3, 0.5, 0.7, 0.85],
    });

    const stemColor = isWithered ? "#9C9377" : "#3F6B3F";
    const bractColor = isWithered ? "#C9A2A0" : "#C41E2C";
    const cyathiaColor = isWithered ? "#C4B98A" : "#F2D230";
    const leafColor = isWithered ? "#A9A98F" : "#2F5A2F";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    // Three clustered bloom centers: one main head plus two smaller
    // satellites offset to either side, like a real poinsettia's grouped
    // bract rosettes.
    const bloomClusters =
        headRadius > 6
            ? [
                { cx: headX, cy: headY, radius: headRadius },
                { cx: headX - headRadius * 1.5, cy: headY + headRadius * 0.55, radius: headRadius * 0.72 },
                { cx: headX + headRadius * 1.5, cy: headY + headRadius * 0.4, radius: headRadius * 0.68 },
            ]
            : [];

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

            {bloomClusters.map((cluster, c) => {
                const petals = computeBloomPetals(cluster.cx, cluster.cy, cluster.radius, 8, 1.6);
                // Bract width scales with this cluster's own radius, not just
                // the main head, so satellites thicken proportionally too.
                const bractWidth = cluster.radius * 0.55;

                return (
                    <g key={c} opacity={isWithered ? 0.6 : 1}>
                        {petals.map((p, i) => (
                            <path key={i} d={buildBractPath(cluster.cx, cluster.cy, p, bractWidth)} fill={bractColor} />
                        ))}
                        {[0, 1, 2, 3].map((k) => (
                            <circle
                                key={k}
                                cx={cluster.cx + (k % 2 === 0 ? -1 : 1) * cluster.radius * 0.25}
                                cy={cluster.cy + (k < 2 ? -1 : 1) * cluster.radius * 0.25}
                                r={cluster.radius * 0.16}
                                fill={cyathiaColor}
                            />
                        ))}
                    </g>
                );
            })}

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