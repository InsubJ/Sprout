import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRadialLeaves } from "../../utils/plantGeometry/radialLeafGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * AlocasiaTinyDancerPlant — Alocasia 'Tiny Dancer'. Render-only; reuses
 * computeRadialLeaves with a narrow upright spread (compact alocasias
 * grow tall and slender, not fanned out) and draws arrow-shaped leaf
 * blades at each tip.
 *
 *   <AlocasiaTinyDancerPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function AlocasiaTinyDancerPlant({
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

    const leaves = computeRadialLeaves(growthPercent, asymmetry, {
        leafCountBase: 1,
        leafDensity: 16,
        maxLeaves: 5,
        angleSpreadDeg: 55,
        lengthBase: 55,
        lengthMultiplier: 0.95,
    });

    const stemColor = isWithered ? "#8FA37E" : "#4A7A4E";
    const leafColor = isWithered ? "#8FA37E" : "#2F6B3A";
    const veinColor = isWithered ? "#B9C6A9" : "#5FA063";
    const showAura = isCompleted && finalVariant === "flawless";
    const showScars = isCompleted && finalVariant === "scarred";

    /** Builds a simple arrow/lance leaf blade polygon pointing along the leaf's angle. */
    const arrowLeafPath = (tipX: number, tipY: number, rotationDeg: number, length: number) => {
        const rad = (rotationDeg * Math.PI) / 180;
        const back = { x: tipX - Math.sin(rad) * length, y: tipY + Math.cos(rad) * length };
        const leftWing = {
            x: (back.x + tipX) / 2 - Math.cos(rad) * length * 0.35,
            y: (back.y + tipY) / 2 - Math.sin(rad) * length * 0.35,
        };
        const rightWing = {
            x: (back.x + tipX) / 2 + Math.cos(rad) * length * 0.35,
            y: (back.y + tipY) / 2 + Math.sin(rad) * length * 0.35,
        };
        return `M${tipX} ${tipY} L${leftWing.x} ${leftWing.y} L${back.x} ${back.y} L${rightWing.x} ${rightWing.y} Z`;
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Alocasia Tiny Dancer at ${Math.round(growthPercent)}% growth${isWithered ? ", withered" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#7FA35C" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {leaves.map((leaf, i) => {
                const blade = arrowLeafPath(leaf.tipX, leaf.tipY, leaf.rotationDeg, isWithered ? 20 : 30);
                return (
                    <g key={i}>
                        <path d={leaf.path} stroke={stemColor} strokeWidth="2.5" fill="none" />
                        <path d={blade} fill={leafColor} opacity={isWithered ? 0.6 : 1} />
                        <line
                            x1={leaf.tipX}
                            y1={leaf.tipY}
                            x2={leaf.tipX - Math.sin((leaf.rotationDeg * Math.PI) / 180) * (isWithered ? 16 : 24)}
                            y2={leaf.tipY + Math.cos((leaf.rotationDeg * Math.PI) / 180) * (isWithered ? 16 : 24)}
                            stroke={veinColor}
                            strokeWidth="1"
                            opacity="0.7"
                        />
                    </g>
                );
            })}

            {showScars && (
                <ScarredAccents
                    marks={[
                        { cx: 179, cy: 296, rx: 6, ry: 4 },
                        { cx: 222, cy: 298, rx: 6, ry: 4 },
                    ]}
                />
            )}
        </svg>
    );
}