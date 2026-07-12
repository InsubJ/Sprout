import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeHumanoidBody } from "../../utils/plantGeometry/humanoidBodyGeometry";
import {
    computeBlossomLimbs,
    computeBlossomFace,
    BlossomEyeType,
} from "../../utils/plantGeometry/blossomGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * BlossomPlant — an elegant anthropomorphic flower character with
 * long flowing hair and graceful limbs. Same PlantProps contract and
 * usePlantGrowth-driven state as every other species; her expression,
 * posture, and hair movement respond to growth and withering.
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
    const body = computeHumanoidBody(growthPercent, {
        legLengthBase: 34,
        legLengthMultiplier: 0.72,
        torsoHeightBase: 20,
        torsoHeightMultiplier: 0.5,
        headRadiusBase: 21,
        headRadiusMultiplier: 0.16,
    });
    const { leftLeg, rightLeg, leftArm, rightArm } = computeBlossomLimbs(body, isWithered, asymmetry);
    const { upperLipPath, lowerLipPath, leftEye, rightEye } = computeBlossomFace(isWithered, isCompleted, isFlawless);

    const skinColor = isWithered ? "#B89AA3" : witherCount >= 2 ? "#C96B95" : "#D9739E";
    const skinHighlight = isWithered ? "#CBB4BB" : "#F0A8C6";
    const lipColor = isWithered ? "#9C7A80" : "#C41E4A";
    const hairColor = isWithered ? "#775B69" : "#5B2F46";
    const hairHighlight = isWithered ? "#927A84" : "#8E4A68";
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
            aria-label={`Blossom, an anthropomorphic flower character with long flowing hair, at ${Math.round(
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

            {/* long, graceful arms */}
            <path d={leftArm.path} stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d={rightArm.path} stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx={leftArm.endX} cy={leftArm.endY} r="5.5" fill={skinColor} opacity={isWithered ? 0.7 : 1} />
            <circle cx={rightArm.endX} cy={rightArm.endY} r="5.5" fill={skinColor} opacity={isWithered ? 0.7 : 1} />

            {/* long flowing hair, drawn behind the face */}
            <g opacity={isWithered ? 0.78 : 1}>
                <path
                    d={`M${200 - body.headRadius * 0.9} ${headCenterY - body.headRadius * 0.55}
                        C${200 - body.headRadius * 1.55} ${headCenterY + body.headRadius * 0.15},
                         ${200 - body.headRadius * 1.35} ${body.shoulderY + 34},
                         ${200 - body.headRadius * 0.85} ${body.hipY + 12}
                        C${200 - body.headRadius * 0.5} ${body.hipY + 34},
                         ${200 - body.headRadius * 0.2} ${body.hipY + 18},
                         ${200 - body.headRadius * 0.35} ${headCenterY + body.headRadius * 0.8}
                        Z`}
                    fill={hairColor}
                />
                <path
                    d={`M${200 + body.headRadius * 0.9} ${headCenterY - body.headRadius * 0.55}
                        C${200 + body.headRadius * 1.55} ${headCenterY + body.headRadius * 0.15},
                         ${200 + body.headRadius * 1.35} ${body.shoulderY + 34},
                         ${200 + body.headRadius * 0.85} ${body.hipY + 12}
                        C${200 + body.headRadius * 0.5} ${body.hipY + 34},
                         ${200 + body.headRadius * 0.2} ${body.hipY + 18},
                         ${200 + body.headRadius * 0.35} ${headCenterY + body.headRadius * 0.8}
                        Z`}
                    fill={hairColor}
                />
                <path
                    d={`M${200 - body.headRadius * 0.76} ${headCenterY - body.headRadius * 0.58}
                        C${200 - body.headRadius * 1.18} ${headCenterY + body.headRadius * 0.55},
                         ${200 - body.headRadius * 0.92} ${body.shoulderY + 42},
                         ${200 - body.headRadius * 0.62} ${body.hipY + 4}`}
                    stroke={hairHighlight}
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                />
                <path
                    d={`M${200 + body.headRadius * 0.7} ${headCenterY - body.headRadius * 0.45}
                        C${200 + body.headRadius * 1.12} ${headCenterY + body.headRadius * 0.62},
                         ${200 + body.headRadius * 0.88} ${body.shoulderY + 46},
                         ${200 + body.headRadius * 0.58} ${body.hipY + 8}`}
                    stroke={hairHighlight}
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                />
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

            {/* full fringe covering the forehead */}
            <path
                d={`M${200 - body.headRadius * 0.96} ${headCenterY - body.headRadius * 0.28}
                    Q${200 - body.headRadius * 0.72} ${headCenterY - body.headRadius * 1.02}
                     200 ${headCenterY - body.headRadius * 0.96}
                    Q${200 + body.headRadius * 0.72} ${headCenterY - body.headRadius * 1.02}
                     ${200 + body.headRadius * 0.96} ${headCenterY - body.headRadius * 0.28}
                    Q${200 + body.headRadius * 0.72} ${headCenterY - body.headRadius * 0.18}
                     ${200 + body.headRadius * 0.48} ${headCenterY - body.headRadius * 0.06}
                    Q${200 + body.headRadius * 0.24} ${headCenterY - body.headRadius * 0.16}
                     200 ${headCenterY - body.headRadius * 0.04}
                    Q${200 - body.headRadius * 0.24} ${headCenterY - body.headRadius * 0.16}
                     ${200 - body.headRadius * 0.48} ${headCenterY - body.headRadius * 0.06}
                    Q${200 - body.headRadius * 0.72} ${headCenterY - body.headRadius * 0.18}
                     ${200 - body.headRadius * 0.96} ${headCenterY - body.headRadius * 0.28}
                    Z`}
                fill={hairColor}
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