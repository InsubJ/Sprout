import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";
import {
  computeCactusArms,
  computeCactusBody,
  computeCactusSpineRows,
  getGrowthState,
  type PlantProps,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function DesertCactusPlant(props: PlantProps) {
  const { size = 260, witherCount } = props;
  const growth = getGrowthState(props);
  const { bodyHeight, bodyTopY } = computeCactusBody(growth.growthPercent);
  const arms = computeCactusArms(growth.growthPercent, growth.asymmetry, bodyTopY);
  const rows = computeCactusSpineRows(bodyHeight, bodyTopY);
  const body = growth.isWithered
    ? "#9CA37C"
    : witherCount >= 4
      ? "#7C9A5E"
      : witherCount >= 2
        ? "#5E9A5B"
        : "#3F8F52";
  const highlight = growth.isWithered ? "#B0B491" : "#5CAE6E";
  const spine = growth.isWithered ? "#D8D2B8" : "#F4EAD1";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Desert cactus at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? <FlawlessAura /> : null}
      <GroundShadow rx={90} />
      <PlantPot color="#B0563A" colorLight="#C46A4C" colorDark="#8C4531" halfWidth={45} />
      <Ellipse cx="200" cy="298" rx="48" ry="5" fill="#E8D3A6" />
      {arms.map((item, index) => (
        <G key={index}>
          <Path d={item.path} stroke={body} strokeWidth="16" strokeLinecap="round" fill="none" />
          <Path
            d={item.highlightPath}
            stroke={highlight}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity={0.5}
          />
        </G>
      ))}
      <Path
        d={`M182 300 Q178 ${bodyTopY + bodyHeight * 0.5} 185 ${bodyTopY + 20} Q195 ${bodyTopY} 200 ${bodyTopY} Q205 ${bodyTopY} 215 ${bodyTopY + 20} Q222 ${bodyTopY + bodyHeight * 0.5} 218 300 Z`}
        fill={body}
      />
      <Path
        d={`M188 300 Q185 ${bodyTopY + bodyHeight * 0.5} 190 ${bodyTopY + 25}`}
        stroke={highlight}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      <Line
        x1="200"
        y1={bodyTopY + 5}
        x2="200"
        y2="298"
        stroke="#2E6B3E"
        strokeWidth="2"
        opacity={0.4}
      />
      {rows.map((row, index) => (
        <G key={index}>
          <Line x1="182" y1={row.y} x2="176" y2={row.y - 4} stroke={spine} strokeWidth="2" />
          <Line x1="218" y1={row.y} x2="224" y2={row.y - 4} stroke={spine} strokeWidth="2" />
        </G>
      ))}
      {growth.growthPercent >= 90 ? (
        <G>
          <Circle
            cx="200"
            cy={bodyTopY - 6}
            r={growth.isWithered ? 5 : 10}
            fill={growth.isWithered ? "#C4A08A" : "#EAA89B"}
          />
          <Circle cx="200" cy={bodyTopY - 6} r={growth.isWithered ? 2 : 4} fill="#FCE4CB" />
        </G>
      ) : null}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 188, cy: 260, rx: 5, ry: 8 },
            { cx: 212, cy: 230, rx: 4, ry: 6 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
