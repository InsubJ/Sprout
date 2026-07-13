import Svg, { Ellipse, G, Path } from "react-native-svg";
import { computeRadialLeaves, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function MarantaPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const leaves = computeRadialLeaves(growth.growthPercent, growth.asymmetry, {
    leafCountBase: 2,
    leafDensity: 14,
    maxLeaves: 7,
    angleSpreadDeg: growth.isWithered ? 70 : 170,
    lengthBase: 40,
    lengthMultiplier: 0.55,
  });
  const leaf = growth.isWithered ? "#8FA37E" : "#3B6B3F";
  const marking = growth.isWithered ? "#6B7A5E" : "#1F4423";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Maranta leuconeura at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#C97B9E" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      {leaves.map((item, index) => (
        <G key={index}>
          <Path d={item.path} stroke={leaf} strokeWidth="2" fill="none" opacity={0.7} />
          <Ellipse
            cx={item.tipX}
            cy={item.tipY}
            rx={growth.isWithered ? 12 : 18}
            ry={growth.isWithered ? 8 : 11}
            fill={leaf}
            opacity={growth.isWithered ? 0.6 : 1}
            transform={`rotate(${item.rotationDeg} ${item.tipX} ${item.tipY})`}
          />
          <Ellipse
            cx={item.tipX}
            cy={item.tipY}
            rx={growth.isWithered ? 6 : 9}
            ry={growth.isWithered ? 3 : 4.5}
            fill={marking}
            opacity={growth.isWithered ? 0.5 : 0.8}
            transform={`rotate(${item.rotationDeg} ${item.tipX} ${item.tipY})`}
          />
        </G>
      ))}
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
