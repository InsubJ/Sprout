import { computeGeneratedTree } from "@sprout/shared";
import type { GeneratedPlantLayer } from "@sprout/shared";
import { G, Path } from "react-native-svg";
import { GeneratedLeafShape } from "./GeneratedLeafShape";

function paletteColour(
  palette: Record<string, string>,
  keys: string[],
  excluded: string,
  fallback: string,
): string {
  for (const key of keys) {
    const value = palette[key];
    if (value && value !== excluded) return value;
  }
  return Object.values(palette).find((value) => value !== excluded) ?? fallback;
}

export function GeneratedTreeLayer({
  layer,
  palette,
  baseY,
  withered,
}: {
  layer: GeneratedPlantLayer;
  palette: Record<string, string>;
  baseY: number;
  withered: boolean;
}): React.JSX.Element {
  const geometry = computeGeneratedTree(layer);
  const trunk = withered
    ? "#817461"
    : (palette.trunk ?? palette.bark ?? palette.stem ?? layer.fill);
  const foliage = withered
    ? "#909278"
    : paletteColour(palette, ["leaf", "foliage", "primary", "secondary"], trunk, "#4F8A4B");
  const foliageAccent = withered
    ? "#A5A58A"
    : paletteColour(palette, ["secondary", "accent", "light"], foliage, foliage);
  const leafStroke = layer.stroke && layer.stroke !== trunk ? layer.stroke : trunk;
  return (
    <G transform={`translate(${geometry.translationX} 0)`}>
      <Path
        d={`M200 ${baseY} C${194 - layer.rotation / 12} ${baseY - 65} ${206 + layer.rotation / 10} ${geometry.topY + 70} 200 ${geometry.topY}`}
        stroke={trunk}
        strokeWidth={Math.max(13, 17 * geometry.scale)}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={`M200 ${baseY - 5} C198 ${baseY - 70} 204 ${geometry.topY + 55} 200 ${geometry.topY + 5}`}
        stroke={foliageAccent}
        strokeWidth={Math.max(3, 4 * geometry.scale)}
        strokeLinecap="round"
        fill="none"
        opacity={0.28}
      />
      {geometry.branches.map((branch, index) => (
        <Path
          key={`branch-${index}`}
          d={branch.path}
          stroke={trunk}
          strokeWidth={Math.max(5, 7 * geometry.scale)}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {geometry.canopyLeaves.map((leaf, index) => (
        <GeneratedLeafShape
          key={`canopy-${index}`}
          shape={geometry.leafShape}
          x={leaf.x}
          y={leaf.y}
          rotation={leaf.rotation}
          scale={leaf.scale}
          fill={index % 4 === 0 ? foliageAccent : foliage}
          stroke={leafStroke}
        />
      ))}
    </G>
  );
}
