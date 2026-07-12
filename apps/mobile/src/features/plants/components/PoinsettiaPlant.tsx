import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import {
  computeBloomPetals,
  computeRadialBloom,
  getGrowthState,
  type PlantProps,
  type RadialBloomPetal,
} from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
const bractPath = (
  cx: number,
  cy: number,
  p: RadialBloomPetal,
  width: number,
) => {
  const dx = p.cx - cx,
    dy = p.cy - cy,
    length = Math.hypot(dx, dy) || 1,
    px = -dy / length,
    py = dx / length,
    bx = cx + dx * 0.42,
    by = cy + dy * 0.42;
  return `M${cx} ${cy} Q${bx + px * width} ${by + py * width} ${p.cx} ${p.cy} Q${bx - px * width} ${by - py * width} ${cx} ${cy} Z`;
};
export function PoinsettiaPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const geometry = computeRadialBloom(growth.growthPercent, {
    heightBase: 35,
    heightMultiplier: 1.15,
    headRadiusBase: 6,
    headRadiusMultiplier: 0.24,
    petalCount: 8,
    petalReach: 1.5,
    leafHeightFractions: [0.3, 0.5, 0.7, 0.85],
  });
  const stem = growth.isWithered ? "#9C9377" : "#3F6B3F",
    bract = growth.isWithered ? "#C9A2A0" : "#C41E2C",
    center = growth.isWithered ? "#C4B98A" : "#F2D230",
    leaf = growth.isWithered ? "#A9A98F" : "#2F5A2F";
  const clusters =
    geometry.headRadius > 6
      ? [
          {
            cx: geometry.headX,
            cy: geometry.headY,
            radius: geometry.headRadius,
          },
          {
            cx: geometry.headX - geometry.headRadius * 1.5,
            cy: geometry.headY + geometry.headRadius * 0.55,
            radius: geometry.headRadius * 0.72,
          },
          {
            cx: geometry.headX + geometry.headRadius * 1.5,
            cy: geometry.headY + geometry.headRadius * 0.4,
            radius: geometry.headRadius * 0.68,
          },
        ]
      : [];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Poinsettia at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#C41E2C" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      <Path
        d={geometry.stemPath}
        stroke={stem}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {geometry.leafPositions.map((item, index) => (
        <Ellipse
          key={index}
          cx={item.x + item.side * 20}
          cy={item.y}
          rx="15"
          ry="7"
          fill={leaf}
          opacity={growth.isWithered ? 0.6 : 0.9}
          transform={`rotate(${item.side * 20} ${item.x} ${item.y})`}
        />
      ))}
      {clusters.map((cluster, index) => {
        const petals = computeBloomPetals(
          cluster.cx,
          cluster.cy,
          cluster.radius,
          8,
          1.6,
        );
        return (
          <G key={index} opacity={growth.isWithered ? 0.6 : 1}>
            {petals.map((item, petalIndex) => (
              <Path
                key={petalIndex}
                d={bractPath(
                  cluster.cx,
                  cluster.cy,
                  item,
                  cluster.radius * 0.55,
                )}
                fill={bract}
              />
            ))}
            {[0, 1, 2, 3].map((item) => (
              <Circle
                key={item}
                cx={
                  cluster.cx + (item % 2 === 0 ? -1 : 1) * cluster.radius * 0.25
                }
                cy={cluster.cy + (item < 2 ? -1 : 1) * cluster.radius * 0.25}
                r={cluster.radius * 0.16}
                fill={center}
              />
            ))}
          </G>
        );
      })}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 180, cy: 296, rx: 6, ry: 4 },
            { cx: 220, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
