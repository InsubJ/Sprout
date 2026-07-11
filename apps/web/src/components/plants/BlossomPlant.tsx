import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeHumanoidBody } from "../../utils/plantGeometry/humanoidBodyGeometry";
import {
    computeBlossomLimbs,
    computeBlossomFace,
    computeUmbrella,
    BlossomEyeType,
} from "../../utils/plantGeometry/blossomGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * BlossomPlant — an anthropomorphic pot plant holding a small round
 * umbrella overhead. Same PlantProps contract and usePlantGrowth-driven
 * state as every other species; her lips, wink, and umbrella tilt are
 * just another expression of growthPercent/isWithered/finalVariant.
 *
 *   <BlossomPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function BlossomPlant({
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
    const body = computeHumanoidBody(growthPercent);
    const { leftLeg, rightLeg, leftArm, rightArm } = computeBlossomLimbs(body, isWithered, asymmetry);
    const { upperLipPath, lowerLipPath, leftEye, rightEye } = computeBlossomFace(isWithered, isCompleted, isFlawless);

    // Umbrella handle sits between the two raised hands.
    const handleX = (leftArm.endX + rightArm.endX) / 2;
    const handleY = Math.min(leftArm.endY, rightArm.endY);
    const umbrella = computeUmbrella(handleX, handleY, isWithered);

    const skinColor = isWithered ? "#B89AA3" : witherCount >= 2 ? "#C96B95" : "#D9739E";
    const skinHighlight = isWithered ? "#CBB4BB" : "#F0A8C6";
    const lipColor = isWithered ? "#9C7A80" : "#C41E4A";
    const umbrellaColor = isWithered ? "#B0A392" : "#F5D97A";
    const showAura = isCompleted && isFlawless;
    const showScars = isCompleted && finalVariant === "scarred";

    const headCenterY = body.headY - body.headRadius * 0.4;

    const renderEye = (eye: BlossomEyeType, cx: number) => {
        switch (eye) {
            case "wink":
                return (
                    <path d={`M${cx - 4} 0 Q${cx} 4 ${cx + 4} 0`} stroke="#3A2430" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                );
            case "droopy":
                return (
                    <path d={`M${cx - 4} -2 Q${cx} 2 ${cx + 4} -3`} stroke="#3A2430" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                );
            case "sparkle":
                return (
                    <g>
                        <circle cx={cx} cy="0" r="4" fill="#3A2430" />
                        <circle cx={cx - 1.2} cy="-1.2" r="1.2" fill="#FFFFFF" />
                    </g>
                );
            case "open":
            default:
                return (
                    <>
                        <circle cx={cx} cy="0" r="3.6" fill="#3A2430" />
                        <line x1={cx - 4} y1="-4" x2={cx + 4} y2="-6" stroke="#3A2430" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                );
        }
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Blossom, an anthropomorphic pot plant holding an umbrella, at ${Math.round(
                growthPercent
            )}% growth${isWithered ? ", withered and sad" : isCompleted ? `, completed (${finalVariant})` : ""}`}
        >
            {showAura && <FlawlessAura color="#F0A8C6" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {/* legs */}
            <path d={leftLeg.path} stroke={skinColor} strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d={rightLeg.path} stroke={skinColor} strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* torso */}
            <path
                d={`M193 ${body.hipY} L193 ${body.shoulderY} Q200 ${body.shoulderY - 6} 207 ${body.shoulderY} L207 ${body.hipY} Z`}
                fill={skinColor}
            />

            {/* arms, raised to meet the umbrella handle */}
            <path d={leftArm.path} stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d={rightArm.path} stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx={leftArm.endX} cy={leftArm.endY} r="5.5" fill={skinColor} opacity={isWithered ? 0.7 : 1} />
            <circle cx={rightArm.endX} cy={rightArm.endY} r="5.5" fill={skinColor} opacity={isWithered ? 0.7 : 1} />

            {/* umbrella, tilting when withered */}
            <g transform={`rotate(${umbrella.tiltDeg} ${umbrella.handleX} ${umbrella.handleY})`}>
                <path d={umbrella.polePath} stroke="#7A5638" strokeWidth="2.5" strokeLinecap="round" />
                <path d={umbrella.canopyPath} fill={umbrellaColor} opacity={isWithered ? 0.7 : 1} />
                {umbrella.spokePaths.map((p, i) => (
                    <path key={i} d={p} stroke="#7A5638" strokeWidth="1" opacity="0.6" />
                ))}
            </g>

            {/* head */}
            <circle cx="200" cy={headCenterY} r={body.headRadius} fill={skinColor} />
            <circle
                cx={200 - body.headRadius * 0.35}
                cy={headCenterY - body.headRadius * 0.35}
                r={body.headRadius * 0.3}
                fill={skinHighlight}
                opacity="0.5"
            />

            {/* face, positioned relative to head center */}
            <g transform={`translate(200 ${headCenterY})`}>
                {renderEye(leftEye, -body.headRadius * 0.32)}
                {renderEye(rightEye, body.headRadius * 0.32)}
                <path d={upperLipPath} fill="none" stroke={lipColor} strokeWidth="2" strokeLinecap="round" />
                <path d={lowerLipPath} fill={lipColor} opacity={isWithered ? 0.7 : 0.95} />
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