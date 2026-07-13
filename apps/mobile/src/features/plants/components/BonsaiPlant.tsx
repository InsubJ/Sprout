import Svg, { Ellipse, G, Path } from "react-native-svg";
import {
  computeTreeBranches,
  computeTreeTrunk,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { Blossoms } from "../shared/Blossoms";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function BonsaiPlant(props: PlantProps) {
  const { size = 260, witherCount } = props;
  const growth = getGrowthState(props);
  const { topY } = computeTreeTrunk(growth.growthPercent);
  const branches = computeTreeBranches(growth.growthPercent, growth.asymmetry, topY);
  const leaf = growth.isWithered
    ? "#A99A6B"
    : witherCount >= 4
      ? "#B79A5E"
      : witherCount >= 2
        ? "#5F8A2E"
        : "#3B6D11";
  const light = growth.isWithered
    ? "#C4B685"
    : witherCount >= 4
      ? "#C9AE72"
      : witherCount >= 2
        ? "#79A63F"
        : "#4E8A18";
  const trunk = growth.isWithered ? "#8A7357" : "#6B4A2F";
  const aura = growth.isCompleted && growth.finalVariant === "flawless";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Bonsai at ${Math.round(growth.growthPercent)}% growth`}
    >
      {aura ? <FlawlessAura /> : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path d={`M200 300 L200 ${topY}`} stroke={trunk} strokeWidth="14" strokeLinecap="round" />
      <Path
        d={`M200 300 L200 ${topY}`}
        stroke={growth.isWithered ? "#B0A181" : "#7A5638"}
        strokeWidth="6"
        strokeLinecap="round"
        opacity={0.5}
      />
      {branches.map((item, index) => (
        <G key={index}>
          <Path
            d={item.path}
            stroke={trunk}
            strokeWidth={growth.isWithered ? 4 : 7}
            fill="none"
            strokeLinecap="round"
          />
          <Ellipse
            cx={item.leafX}
            cy={item.leafY}
            rx={growth.isWithered ? 12 : 18}
            ry={growth.isWithered ? 8 : 12}
            fill={leaf}
            opacity={growth.isWithered ? 0.6 : 1}
          />
        </G>
      ))}
      {growth.growthPercent >= 15 ? (
        <Ellipse
          cx="200"
          cy={topY - 15}
          rx={growth.isWithered ? 18 : 30}
          ry={growth.isWithered ? 12 : 18}
          fill={light}
          opacity={growth.isWithered ? 0.6 : 1}
        />
      ) : null}
      {aura ? (
        <Blossoms
          positions={[
            { cx: 150, cy: 90, r: 4 },
            { cx: 245, cy: 100, r: 4 },
            { cx: 200, cy: 70, r: 4 },
            { cx: 120, cy: 150, r: 3.5 },
            { cx: 280, cy: 155, r: 3.5 },
          ]}
        />
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 170, cy: 295, rx: 6, ry: 4 },
            { cx: 235, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
