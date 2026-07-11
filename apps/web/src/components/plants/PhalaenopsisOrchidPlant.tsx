import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeOrchidSpike } from "../../utils/plantGeometry/orchidGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * PhalaenopsisOrchidPlant — Phalaenopsis Scarlett Jubilee. Render-only;
 * all math lives in usePlantGrowth / orchidGeometry, whose arching-spike
 * shape is genuinely distinct from trees, stalks, vines, or rosettes.
 *
 *   <PhalaenopsisOrchidPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function PhalaenopsisOrchidPlant({
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

    const { spikePath, blooms, basalLeaves } = computeOrchidSpike(growthPercent, asymmetry);

    const spikeColor = isWithered ? "#8A9377" : "#4A6B3F";
    const leafColor = isWithered ? "#8A9377" : "#2F5A38";
    const bloomColor = isWithered ? "#B98A9A" : "#C4184F";
    const bloomThroat = isWithered ? "#D9BFC7" : "#F2C230";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Phalaenopsis Scarlett Jubilee at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#C4184F" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {basalLeaves.map((leaf, i) => (
                <ellipse
                    key={i}
                    cx={leaf.x}
                    cy={leaf.y}
                    rx="22"
                    ry="8"
                    fill={leafColor}
                    opacity={isWithered ? 0.6 : 0.9}
                    transform={`rotate(${leaf.side * 10} ${leaf.x} ${leaf.y})`}
                />
            ))}

            <path d={spikePath} stroke={spikeColor} strokeWidth="3" fill="none" strokeLinecap="round" />

            {blooms.map((bloom, i) => (
                <g key={i} transform={`rotate(${bloom.rotationDeg} ${bloom.x} ${bloom.y})`}>
                    <ellipse cx={bloom.x} cy={bloom.y - 7} rx="7" ry="5" fill={bloomColor} opacity={isWithered ? 0.6 : 1} />
                    <ellipse cx={bloom.x} cy={bloom.y + 7} rx="7" ry="5" fill={bloomColor} opacity={isWithered ? 0.6 : 1} />
                    <ellipse cx={bloom.x - 8} cy={bloom.y} rx="6" ry="4.5" fill={bloomColor} opacity={isWithered ? 0.6 : 1} />
                    <ellipse cx={bloom.x + 8} cy={bloom.y} rx="6" ry="4.5" fill={bloomColor} opacity={isWithered ? 0.6 : 1} />
                    <circle cx={bloom.x} cy={bloom.y} r="3.5" fill={bloomThroat} opacity={isWithered ? 0.7 : 1} />
                </g>
            ))}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 178, cy: 296, rx: 6, ry: 4 },
                        { cx: 224, cy: 298, rx: 6, ry: 4 },
                    ]}
                />
            )}
        </svg>
    );
}