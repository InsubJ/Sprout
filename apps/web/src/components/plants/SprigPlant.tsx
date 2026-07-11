import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import {
    computeDogBody,
    computeDogLegs,
    computeDogEars,
    computeDogTail,
    computeDogFace,
} from "../../utils/plantGeometry/dogGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * SprigPlant — a quadruped plant styled like a dog: floppy leaf ears,
 * a curling vine tail, four little leg-stems. Same PlantProps contract
 * and usePlantGrowth-driven state as every other species; his droopy
 * ears and tail are just another expression of growthPercent/
 * isWithered/finalVariant, the same way leaf color or trunk shape are
 * elsewhere.
 *
 *   <SprigPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function SprigPlant({
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

    const isFlawless = finalVariant === "flawless";
    const body = computeDogBody(growthPercent);
    const legs = computeDogLegs(body, isWithered, asymmetry);
    const { eyeShape, mouthPath } = computeDogFace(isWithered, isCompleted, isFlawless);

    const frontX = 200 - body.bodyLength / 2 + 10;
    const backX = 200 + body.bodyLength / 2 - 10;
    const headCenterX = frontX - body.headRadius * 0.7;
    const headCenterY = body.torsoY - body.bodyHeight * 0.1;
    const ears = computeDogEars(headCenterX, headCenterY, body.headRadius, isWithered);
    const tailPath = computeDogTail(backX + 6, body.torsoY, body.tailLength, isWithered);

    const coatColor = isWithered ? "#9CA37C" : witherCount >= 2 ? "#7FA35E" : "#6FA050";
    const coatHighlight = isWithered ? "#B0B491" : "#8FC26C";
    const earColor = isWithered ? "#8FA37E" : "#4E8A3F";
    const showAura = isCompleted && isFlawless;
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Sprig, a dog-shaped plant, at ${Math.round(growthPercent)}% growth${isWithered ? ", withered and sad" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#8FC26C" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {/* tail, drawn first so it sits behind the torso */}
            <path d={tailPath} stroke={earColor} strokeWidth="5" strokeLinecap="round" fill="none" opacity={isWithered ? 0.7 : 1} />

            {/* legs */}
            {[legs.frontLeft, legs.frontRight, legs.backLeft, legs.backRight].map((leg, i) => (
                <g key={i}>
                    <path d={leg.path} stroke={coatColor} strokeWidth="7" strokeLinecap="round" />
                    <ellipse cx={leg.pawX} cy={leg.pawY} rx="6" ry="3.5" fill={earColor} opacity={isWithered ? 0.6 : 1} />
                </g>
            ))}

            {/* torso */}
            <ellipse cx="200" cy={body.torsoY} rx={body.bodyLength / 2} ry={body.bodyHeight / 2} fill={coatColor} />
            <ellipse
                cx={200 - body.bodyLength * 0.15}
                cy={body.torsoY - body.bodyHeight * 0.2}
                rx={body.bodyLength * 0.18}
                ry={body.bodyHeight * 0.18}
                fill={coatHighlight}
                opacity="0.5"
            />

            {/* ears, behind the head */}
            <path d={ears.left.path} stroke={earColor} strokeWidth="9" strokeLinecap="round" fill="none" opacity={isWithered ? 0.7 : 1} />
            <path d={ears.right.path} stroke={earColor} strokeWidth="9" strokeLinecap="round" fill="none" opacity={isWithered ? 0.7 : 1} />

            {/* head + snout */}
            <circle cx={headCenterX} cy={headCenterY} r={body.headRadius} fill={coatColor} />
            <ellipse
                cx={headCenterX - body.headRadius * 0.85}
                cy={headCenterY + body.headRadius * 0.15}
                rx={body.headRadius * 0.45}
                ry={body.headRadius * 0.32}
                fill={coatColor}
            />
            <circle cx={headCenterX - body.headRadius * 1.2} cy={headCenterY + body.headRadius * 0.15} r={body.headRadius * 0.13} fill="#2F2A20" />

            {/* face, positioned relative to the head center */}
            <g transform={`translate(${headCenterX} ${headCenterY})`}>
                {eyeShape === "droopy" ? (
                    <path d="M-2 -6 Q2 -3 6 -7" stroke="#2F2A20" strokeWidth="2" strokeLinecap="round" fill="none" />
                ) : eyeShape === "sparkle" ? (
                    <g>
                        <circle cx="2" cy="-6" r="3.2" fill="#2F2A20" />
                        <circle cx="0.8" cy="-7.2" r="1" fill="#FFFFFF" />
                    </g>
                ) : (
                    <circle cx="2" cy="-6" r="2.8" fill="#2F2A20" />
                )}
                <path d={mouthPath} stroke="#2F2A20" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>

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