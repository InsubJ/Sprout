import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import { computeJasonFace, computeJasonArms } from "../../utils/plantGeometry/jasonGeometry";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";
import ScarredAccents from "./shared/ScarredAccents";

/**
 * JasonPlant — an anthropomorphic pot plant. Same PlantProps contract
 * and usePlantGrowth-driven state as every other species; his face and
 * arm posture are just another expression of growthPercent/isWithered/
 * finalVariant, the same way leaf color or trunk shape are elsewhere.
 *
 *   <JasonPlant
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function JasonPlant({
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
    const { mouthPath, eyeShape } = computeJasonFace(isWithered, isCompleted, isFlawless);
    const { leftArm, rightArm } = computeJasonArms(growthPercent, isWithered, asymmetry);

    const bodySize = 30 + growthPercent * 0.35;
    const bodyColor = isWithered ? "#9CA37C" : witherCount >= 2 ? "#5E9A5B" : "#4E9648";
    const bodyHighlight = isWithered ? "#B0B491" : "#6FB35F";
    const cheekColor = isWithered ? "#B79A7A" : "#F2A6A6";
    const showAura = isCompleted && isFlawless;
    const showScars = isCompleted && finalVariant === "scarred";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Jason, an anthropomorphic pot plant, at ${Math.round(growthPercent)}% growth${isWithered ? ", withered and sad" : isCompleted ? `, completed (${finalVariant})` : ""
                }`}
        >
            {showAura && <FlawlessAura color="#F2A6A6" />}
            <GroundShadow />
            <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

            {/* short stem/neck from pot to body */}
            <path
                d="M200 300 L200 240"
                stroke={isWithered ? "#8A9377" : "#3F7D3A"}
                strokeWidth="10"
                strokeLinecap="round"
            />

            {/* arms — droop down when withered, reach up/out when healthy */}
            <path d={leftArm.path} stroke={bodyColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d={rightArm.path} stroke={bodyColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx={leftArm.handX} cy={leftArm.handY} r="7" fill={bodyColor} opacity={isWithered ? 0.7 : 1} />
            <circle cx={rightArm.handX} cy={rightArm.handY} r="7" fill={bodyColor} opacity={isWithered ? 0.7 : 1} />

            {/* leafy round head/body where the face sits */}
            <circle cx="200" cy="215" r={bodySize} fill={bodyColor} />
            <circle cx="185" cy="200" r={bodySize * 0.35} fill={bodyHighlight} opacity="0.5" />

            {/* face */}
            <g>
                {eyeShape === "droopy" && (
                    <>
                        <path d="M182 205 Q186 210 190 206" stroke="#1F331E" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M210 206 Q214 210 218 205" stroke="#1F331E" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </>
                )}
                {eyeShape !== "droopy" && (
                    <>
                        <circle cx="186" cy="205" r={eyeShape === "happy" ? 5 : 4} fill="#1F331E" />
                        <circle cx="214" cy="205" r={eyeShape === "happy" ? 5 : 4} fill="#1F331E" />
                    </>
                )}

                {(eyeShape === "round" || eyeShape === "happy") && (
                    <>
                        <circle cx="175" cy="216" r="6" fill={cheekColor} opacity="0.6" />
                        <circle cx="225" cy="216" r="6" fill={cheekColor} opacity="0.6" />
                    </>
                )}

                <path d={mouthPath} stroke="#1F331E" strokeWidth="3" strokeLinecap="round" fill="none" />
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