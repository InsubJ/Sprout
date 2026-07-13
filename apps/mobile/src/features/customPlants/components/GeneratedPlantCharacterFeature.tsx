import { Circle, Ellipse, G, Path, Polygon, Rect } from "react-native-svg";
import type { GeneratedPlantLayer } from "@sprout/shared";

export function GeneratedPlantCharacterFeature({
  layer,
  fill,
  stroke,
}: {
  layer: GeneratedPlantLayer;
  fill: string;
  stroke: string;
}): React.JSX.Element {
  const { x, y } = layer.anchor;
  const scale = layer.scale;
  const detail = stroke === fill ? "#2D2232" : stroke;
  if (layer.type === "face") {
    return (
      <G transform={`rotate(${layer.rotation} ${x} ${y})`}>
        <Circle cx={x - 8 * scale} cy={y - 3 * scale} r={3.5 * scale} fill={detail} />
        <Circle cx={x + 8 * scale} cy={y - 3 * scale} r={3.5 * scale} fill={detail} />
        <Path
          d={`M ${x - 8 * scale} ${y + 7 * scale} Q ${x} ${y + 15 * scale} ${x + 8 * scale} ${y + 7 * scale}`}
          fill="none"
          stroke={detail}
          strokeWidth={2.5 * scale}
          strokeLinecap="round"
        />
      </G>
    );
  }

  const geometry = layer.geometry.toLowerCase();
  if (geometry.includes("crown")) {
    return (
      <Polygon
        points={`${x - 22 * scale},${y + 12 * scale} ${x - 18 * scale},${y - 14 * scale} ${x - 7 * scale},${y - 2 * scale} ${x},${y - 19 * scale} ${x + 7 * scale},${y - 2 * scale} ${x + 18 * scale},${y - 14 * scale} ${x + 22 * scale},${y + 12 * scale}`}
        fill={fill}
        stroke={detail}
        strokeWidth={2}
      />
    );
  }
  if (geometry.includes("bow")) {
    return (
      <G transform={`rotate(${layer.rotation} ${x} ${y})`}>
        <Ellipse cx={x - 12 * scale} cy={y} rx={13 * scale} ry={9 * scale} fill={fill} />
        <Ellipse cx={x + 12 * scale} cy={y} rx={13 * scale} ry={9 * scale} fill={fill} />
        <Circle cx={x} cy={y} r={6 * scale} fill={detail} />
      </G>
    );
  }
  return (
    <G transform={`rotate(${layer.rotation} ${x} ${y})`}>
      <Ellipse cx={x} cy={y - 6 * scale} rx={22 * scale} ry={11 * scale} fill={detail} />
      <Rect
        x={x - 17 * scale}
        y={y - 29 * scale}
        width={34 * scale}
        height={25 * scale}
        rx={5 * scale}
        fill={fill}
        stroke={detail}
      />
    </G>
  );
}
