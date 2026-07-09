import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeRemyLimbs, computeRemyFace, RemyEyeType } from "../../utils/plantGeometry/remyGeometry";
import { computeHumanoidBody } from "../../utils/plantGeometry/humanoidBodyGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * RemyPlant — an anthropomorphic pot plant with a full body: legs,
 * torso, arms, and head, all scaling with growth. Same PlantProps
 * contract and usePlantGrowth-driven state as every other species —
 * his cheeky-rascal stance and wink are just another expression of
 * growthPercent/isWithered/finalVariant, the same way leaf color or
 * trunk shape are elsewhere.
 *
 *   <RemyPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function RemyPlant({
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
    const { leftLeg, rightLeg, leftArm, rightArm } = computeRemyLimbs(body, isWithered, asymmetry);
    const { mouthPath, leftEye, rightEye } = computeRemyFace(isWithered, isCompleted, isFlawless);

    const skinColor = isWithered ? "#8CA3B8" : witherCount >= 2 ? "#3C6E9A" : "#2F6FA8";
    const skinHighlight = isWithered ? "#B0C4D6" : "#5FA0D9";
    const cheekColor = isWithered ? "#8FA3B0" : "#F2A6A6";
    const leafTuftColor = isWithered ? "#9DAAA0" : "#3B8F45";
    const showAura = isCompleted && isFlawless;
    const showScars = isCompleted && finalVariant === "scarred";

    const headCenterY = body.headY - body.headRadius * 0.4;

    const renderEye = (eye: RemyEyeType, cx: number) => {
        switch (eye) {
            case "wink":
                return (
                    <path d={`M${cx - 4} 0 Q${cx} 4 ${cx + 4} 0`} stroke="#1F331E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                );
            case "droopy":
                return (
                    <path d={`M${cx - 4} -2 Q${cx} 2 ${cx + 4} -3`} stroke="#1F331E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                );
            case "sparkle":
                return (
                    <g>
                        <circle cx={cx} cy="0" r="4" fill="#1F331E" />
                        <circle cx={cx - 1.2} cy="-1.2" r="1.2" fill="#FFFFFF" />
                    </g>
                );
            case "open":
            default:
                return <circle cx={cx} cy="0" r="3.6" fill="#1F331E" />;
        }
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Remy, an anthropomorphic pot plant, at ${Math.round(growthPercent)}% growth${isWithered ? ", withered and sad" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#F2A6A6" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {/* legs */}
            <path d={leftLeg.path} stroke={skinColor} strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d={rightLeg.path} stroke={skinColor} strokeWidth="9" strokeLinecap="round" fill="none" />
            <ellipse cx={leftLeg.endX} cy={leftLeg.endY} rx="8" ry="4" fill={leafTuftColor} opacity={isWithered ? 0.6 : 1} />
            <ellipse cx={rightLeg.endX} cy={rightLeg.endY} rx="8" ry="4" fill={leafTuftColor} opacity={isWithered ? 0.6 : 1} />

            {/* torso */}
            <path
                d={`M193 ${body.hipY} L193 ${body.shoulderY} Q200 ${body.shoulderY - 6} 207 ${body.shoulderY} L207 ${body.hipY} Z`}
                fill={skinColor}
            />

            {/* arms */}
            <path d={leftArm.path} stroke={skinColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d={rightArm.path} stroke={skinColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <circle cx={leftArm.endX} cy={leftArm.endY} r="6" fill={skinColor} opacity={isWithered ? 0.7 : 1} />
            <circle cx={rightArm.endX} cy={rightArm.endY} r="6" fill={skinColor} opacity={isWithered ? 0.7 : 1} />

            {/* head */}
            <circle cx="200" cy={headCenterY} r={body.headRadius} fill={skinColor} />
            <circle
                cx={200 - body.headRadius * 0.35}
                cy={headCenterY - body.headRadius * 0.35}
                r={body.headRadius * 0.3}
                fill={skinHighlight}
                opacity="0.5"
            />

            {/* jaunty leaf tuft on top, a little rascal flourish */}
            <path
                d={`M${200 - body.headRadius * 0.3} ${headCenterY - body.headRadius}
            Q${200 - body.headRadius * 0.6} ${headCenterY - body.headRadius * 1.6}
            ${200 - body.headRadius * 0.1} ${headCenterY - body.headRadius * 1.2}`}
                stroke={leafTuftColor}
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
            />

            {/* face, positioned relative to head center */}
            <g transform={`translate(200 ${headCenterY})`}>
                {renderEye(leftEye, -body.headRadius * 0.32)}
                {renderEye(rightEye, body.headRadius * 0.32)}

                {(leftEye === "open" || leftEye === "wink") && (
                    <>
                        <circle cx={-body.headRadius * 0.55} cy={body.headRadius * 0.25} r="4" fill={cheekColor} opacity="0.6" />
                        <circle cx={body.headRadius * 0.55} cy={body.headRadius * 0.25} r="4" fill={cheekColor} opacity="0.6" />
                    </>
                )}

                <path d={mouthPath} stroke="#1F331E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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