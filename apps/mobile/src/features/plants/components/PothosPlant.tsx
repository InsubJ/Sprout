import Svg, { Ellipse, G, Path } from "react-native-svg";
import { computePothosVines, getGrowthState, type PlantProps } from "@sprout/shared";
import { Blossoms } from "../shared/Blossoms";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { PlantStool } from "../shared/PlantStool";
import { ScarredAccents } from "../shared/ScarredAccents";

export function PothosPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const vines = computePothosVines(growth.growthPercent, growth.asymmetry);
  const vine = growth.isWithered ? "#8FA378" : "#3F7D3A";
  const leaf = growth.isWithered ? "#A9B991" : "#4E9648";
  const accent = growth.isWithered ? "#C4CBAE" : "#8FC65C";
  const aura = growth.isCompleted && growth.finalVariant === "flawless";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Pothos at ${Math.round(growth.growthPercent)}% growth`}
    >
      <G>
        {aura ? <FlawlessAura /> : null}
        <GroundShadow />
        <PlantStool />
        <G transform="translate(0 -100)">
          <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
          {vines.map((item, index) => (
            <G key={index}>
              <Path
                d={item.path}
                stroke={vine}
                strokeWidth={growth.isWithered ? 2 : 3}
                fill="none"
                strokeLinecap="round"
              />
              {item.leaves.map((position, leafIndex) => (
                <Ellipse
                  key={leafIndex}
                  cx={position.x}
                  cy={position.y}
                  rx={growth.isWithered ? 8 : 12}
                  ry={growth.isWithered ? 5 : 8}
                  fill={leafIndex % 2 ? accent : leaf}
                  opacity={growth.isWithered ? 0.6 : 1}
                  transform={`rotate(${position.rotation} ${position.x} ${position.y})`}
                />
              ))}
            </G>
          ))}
          {aura ? (
            <Blossoms
              positions={[
                { cx: 150, cy: 200, r: 3.5 },
                { cx: 250, cy: 205, r: 3.5 },
                { cx: 200, cy: 190, r: 3.5 },
              ]}
            />
          ) : null}
          {growth.isCompleted && growth.finalVariant === "scarred" ? (
            <ScarredAccents
              marks={[
                { cx: 175, cy: 296, rx: 6, ry: 4 },
                { cx: 228, cy: 298, rx: 6, ry: 4 },
              ]}
            />
          ) : null}
        </G>
      </G>
    </Svg>
  );
}
