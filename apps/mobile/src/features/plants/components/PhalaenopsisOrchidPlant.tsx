import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { computeOrchidSpike, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function PhalaenopsisOrchidPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const geometry = computeOrchidSpike(growth.growthPercent, growth.asymmetry);
  const spike = growth.isWithered ? "#8A9377" : "#4A6B3F";
  const leaf = growth.isWithered ? "#8A9377" : "#2F5A38";
  const bloom = growth.isWithered ? "#B98A9A" : "#C4184F";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Orchid Scarlett Jubilee at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#C4184F" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      {geometry.basalLeaves.map((item, index) => (
        <Ellipse
          key={index}
          cx={item.x}
          cy={item.y}
          rx="22"
          ry="8"
          fill={leaf}
          opacity={growth.isWithered ? 0.6 : 0.9}
          transform={`rotate(${item.side * 10} ${item.x} ${item.y})`}
        />
      ))}
      <Path
        d={geometry.spikePath}
        stroke={spike}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {geometry.blooms.map((item, index) => (
        <G key={index} transform={`rotate(${item.rotationDeg} ${item.x} ${item.y})`}>
          <Ellipse
            cx={item.x}
            cy={item.y - 7}
            rx="7"
            ry="5"
            fill={bloom}
            opacity={growth.isWithered ? 0.6 : 1}
          />
          <Ellipse
            cx={item.x}
            cy={item.y + 7}
            rx="7"
            ry="5"
            fill={bloom}
            opacity={growth.isWithered ? 0.6 : 1}
          />
          <Ellipse cx={item.x - 8} cy={item.y} rx="6" ry="4.5" fill={bloom} />
          <Ellipse cx={item.x + 8} cy={item.y} rx="6" ry="4.5" fill={bloom} />
          <Circle
            cx={item.x}
            cy={item.y}
            r="3.5"
            fill={growth.isWithered ? "#D9BFC7" : "#F2C230"}
          />
        </G>
      ))}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 178, cy: 296, rx: 6, ry: 4 },
            { cx: 224, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
