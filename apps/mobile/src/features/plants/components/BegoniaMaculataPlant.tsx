import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { computeStalks, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";
export function BegoniaMaculataPlant(props: PlantProps) {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const canes = computeStalks(growth.growthPercent, growth.asymmetry, {
    maxStalks: 3,
    stalkDensity: 30,
    heightBase: 35,
    heightMultiplier: 1.15,
    topClusterSize: 0,
    leafAttachmentsPerStalk: 3,
  });
  const cane = growth.isWithered ? "#8A8574" : "#3F5A2F";
  const leaf = growth.isWithered ? "#8FA37E" : "#2F5A3B";
  const spots = growth.isWithered ? "#C4C4B0" : "#EDEDE0";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Begonia Maculata at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#7A2E3A" />
      ) : null}
      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />
      {canes.map((item, index) => (
        <G key={index}>
          <Path
            d={item.path}
            stroke={cane}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {item.leafAttachments.map((position, leafIndex) => (
            <G key={leafIndex}>
              <Ellipse
                cx={position.x + position.side * 20}
                cy={position.y}
                rx={growth.isWithered ? 12 : 18}
                ry={growth.isWithered ? 7 : 10}
                fill={leaf}
                opacity={growth.isWithered ? 0.6 : 1}
                transform={`rotate(${position.side * 15} ${position.x} ${position.y})`}
              />
              {!growth.isWithered
                ? [0, 1, 2].map((dot) => (
                    <Circle
                      key={dot}
                      cx={position.x + position.side * (14 + dot * 6)}
                      cy={position.y - 2 + (dot % 2) * 4}
                      r="1.6"
                      fill={spots}
                    />
                  ))
                : null}
            </G>
          ))}
        </G>
      ))}
      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents
          marks={[
            { cx: 181, cy: 296, rx: 6, ry: 4 },
            { cx: 219, cy: 298, rx: 6, ry: 4 },
          ]}
        />
      ) : null}
    </Svg>
  );
}
