import Svg, { Circle, Ellipse, G, Line, Rect } from "react-native-svg";
import type { GeneratedPlantLayer, GeneratedPlantSpec } from "@sprout/shared";
import { GeneratedPlantCharacterFeature } from "./GeneratedPlantCharacterFeature";
import { GeneratedFoliageLayer } from "./GeneratedFoliageLayer";
import { GeneratedTreeLayer } from "./GeneratedTreeLayer";
export type GeneratedPlantVisualState = "healthy" | "withered" | "completed";
function Layer({
  layer,
  state,
  palette,
  potStyle,
}: {
  layer: GeneratedPlantLayer;
  state: GeneratedPlantVisualState;
  palette: Record<string, string>;
  potStyle: GeneratedPlantSpec["base"]["potStyle"];
}) {
  const fill = state === "withered" ? "#8E9277" : layer.fill;
  const stroke = state === "withered" ? "#666A55" : (layer.stroke ?? fill);
  const count = layer.count ?? layer.petalCount ?? 1;
  const items = Array.from({ length: count }, (_, index) => index);
  if (layer.type === "tree")
    return (
      <GeneratedTreeLayer
        layer={layer}
        palette={palette}
        baseY={potStyle === "none" ? 330 : 292}
        withered={state === "withered"}
      />
    );
  if (layer.type === "stalk" || layer.type === "vine")
    return (
      <Line
        x1={layer.anchor.x}
        y1={310}
        x2={layer.anchor.x}
        y2={layer.anchor.y}
        stroke={fill}
        strokeWidth={Math.max(4, 10 * layer.scale)}
        strokeLinecap="round"
      />
    );
  if (layer.type === "cactus_arm")
    return (
      <Rect
        x={layer.anchor.x - 16 * layer.scale}
        y={layer.anchor.y - 60 * layer.scale}
        width={32 * layer.scale}
        height={90 * layer.scale}
        rx={16 * layer.scale}
        fill={fill}
        stroke={stroke}
      />
    );
  if (layer.type === "face" || layer.type === "accessory")
    return <GeneratedPlantCharacterFeature layer={layer} fill={fill} stroke={stroke} />;
  if (["radial_leaf", "pothos_leaf", "spider_leaf"].includes(layer.type))
    return <GeneratedFoliageLayer layer={layer} fill={fill} stroke={stroke} />;
  if (layer.type === "decorative_shape")
    return (
      <Circle
        cx={layer.anchor.x}
        cy={layer.anchor.y}
        r={18 * layer.scale}
        fill={fill}
        stroke={stroke}
      />
    );
  return (
    <G>
      {items.map((_, index) => {
        const angle = (index / count) * Math.PI * 2 + (layer.rotation * Math.PI) / 180;
        const radius =
          layer.type.includes("bloom") ||
          layer.type.includes("cluster") ||
          layer.type.includes("head")
            ? 22 * layer.scale
            : 42 * layer.scale;
        const cx = layer.anchor.x + Math.cos(angle) * radius,
          cy = layer.anchor.y + Math.sin(angle) * radius;
        return (
          <Ellipse
            key={`${layer.type}-${index}`}
            cx={cx}
            cy={cy}
            rx={(layer.type.includes("leaf") ? 12 : 10) * layer.scale}
            ry={(layer.type.includes("leaf") ? 28 : 18) * layer.scale}
            transform={`rotate(${(angle * 180) / Math.PI + 90} ${cx} ${cy})`}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      })}
      <Circle
        cx={layer.anchor.x}
        cy={layer.anchor.y}
        r={10 * layer.scale}
        fill={fill}
        stroke={stroke}
      />
    </G>
  );
}
export function GeneratedPlantRenderer({
  spec,
  size = 260,
  state = "healthy",
}: {
  spec: GeneratedPlantSpec;
  size?: number;
  state?: GeneratedPlantVisualState;
}): React.JSX.Element {
  let treeIncluded = false;
  const layers = [...spec.layers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .filter((layer) => {
      if (layer.type !== "tree") return true;
      if (treeIncluded) return false;
      treeIncluded = true;
      return true;
    });
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`${spec.displayName}, custom plant, ${state}`}
    >
      {state === "completed" ? (
        <G>
          <Ellipse
            cx="200"
            cy="185"
            rx="126"
            ry="137"
            fill={spec.palette.accent ?? spec.palette.primary ?? "#F5DF8C"}
            opacity=".055"
          />
          <Ellipse
            cx="200"
            cy="185"
            rx="96"
            ry="108"
            fill={spec.palette.accent ?? spec.palette.primary ?? "#F5DF8C"}
            opacity=".045"
          />
        </G>
      ) : null}
      {spec.base.groundShadow ? (
        <Ellipse cx="200" cy="340" rx="82" ry="14" fill="rgba(0,0,0,.14)" />
      ) : null}
      {spec.base.potStyle !== "none" ? (
        <G>
          <Rect
            x="145"
            y="286"
            width="110"
            height="58"
            rx={spec.base.potStyle === "rounded" ? 24 : 8}
            fill={spec.palette.pot ?? "#8B6F47"}
          />
          <Rect
            x="135"
            y="278"
            width="130"
            height="20"
            rx="8"
            fill={spec.palette.pot ?? "#8B6F47"}
          />
        </G>
      ) : null}
      {layers.map((layer, index) => (
        <Layer
          key={`${layer.type}-${index}`}
          layer={layer}
          state={state}
          palette={spec.palette}
          potStyle={spec.base.potStyle}
        />
      ))}
    </Svg>
  );
}
