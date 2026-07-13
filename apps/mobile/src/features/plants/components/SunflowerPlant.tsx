import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { computeSunflowerStem, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function SunflowerPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const geometry = computeSunflowerStem(growth.growthPercent);
  const stem = growth.isWithered ? "#A9A37E" : "#4E7D3A";
  const petal = growth.isWithered ? "#C9BE8A" : "#F2C230";
  const disc = growth.isWithered ? "#8A7A5A" : "#7A5230";
  const petals = Array.from({ length: geometry.petalCount }, (_, index) => {
    const angle = (index / geometry.petalCount) * Math.PI * 2;
    return {
      cx: geometry.headX + Math.cos(angle) * geometry.headRadius * 1.6,
      cy: geometry.headY + Math.sin(angle) * geometry.headRadius * 1.6,
      rotation: (angle * 180) / Math.PI,
    };
  });
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Sunflower at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#F2C230" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path d={geometry.stemPath} stroke={stem} strokeWidth="6" strokeLinecap="round" fill="none" />
      {geometry.leafPositions.map((item, index) => (
        <Ellipse
          key={index}
          cx={item.x + item.side * 22}
          cy={item.y}
          rx="16"
          ry="9"
          fill={stem}
          opacity={growth.isWithered ? 0.6 : 0.9}
          transform={`rotate(${item.side * 20} ${item.x} ${item.y})`}
        />
      ))}
      {geometry.headRadius > 10 ? (
        <G opacity={growth.isWithered ? 0.6 : 1}>
          {petals.map((item, index) => (
            <Ellipse
              key={index}
              cx={item.cx}
              cy={item.cy}
              rx={geometry.headRadius * 0.55}
              ry={geometry.headRadius * 0.28}
              fill={petal}
              transform={`rotate(${item.rotation} ${item.cx} ${item.cy})`}
            />
          ))}
          <Circle cx={geometry.headX} cy={geometry.headY} r={geometry.headRadius} fill={disc} />
        </G>
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 180, cy: 296, rx: 6, ry: 4 },
            { cx: 222, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
