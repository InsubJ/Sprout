import Svg, { Circle, G, Path } from "react-native-svg";
import { computeRadialBloom, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function WaratahPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const geometry = computeRadialBloom(growth.growthPercent, {
    heightBase: 45,
    heightMultiplier: 1.2,
    headRadiusBase: 8,
    headRadiusMultiplier: 0.22,
    petalCount: 9,
    petalReach: 1.15,
    leafHeightFractions: [0.35, 0.55, 0.75],
  });
  const stem = growth.isWithered ? "#9C9377" : "#5C6B3F";
  const bract = growth.isWithered ? "#C9A2A0" : "#B31B34";
  const dome = growth.isWithered ? "#8A7A6F" : "#7A0E20";
  const leaf = growth.isWithered ? "#A9A98F" : "#3F6B3F";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Waratah at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#B31B34" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path d={geometry.stemPath} stroke={stem} strokeWidth="7" strokeLinecap="round" fill="none" />
      {geometry.leafPositions.map((item, index) => (
        <Path
          key={index}
          d={`M${item.x} ${item.y} L${item.x + item.side * 26} ${item.y - 8}`}
          stroke={leaf}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={growth.isWithered ? 0.6 : 0.9}
        />
      ))}
      {geometry.headRadius > 8 ? (
        <G opacity={growth.isWithered ? 0.6 : 1}>
          {geometry.petals.map((item, index) => (
            <Path
              key={index}
              d={`M${geometry.headX} ${geometry.headY} L${item.cx} ${item.cy}`}
              stroke={bract}
              strokeWidth={geometry.headRadius * 0.22}
              strokeLinecap="round"
            />
          ))}
          <Circle
            cx={geometry.headX}
            cy={geometry.headY}
            r={geometry.headRadius * 0.6}
            fill={dome}
          />
        </G>
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 177, cy: 296, rx: 6, ry: 4 },
            { cx: 225, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
