import { computeGeneratedFoliage, resolveGeneratedLeafShape } from "@sprout/shared";
import type { GeneratedPlantLayer } from "@sprout/shared";
import { GeneratedLeafShape } from "./GeneratedLeafShape";

export function GeneratedFoliageLayer({
  layer,
  fill,
  stroke,
}: {
  layer: GeneratedPlantLayer;
  fill: string;
  stroke: string;
}): React.JSX.Element {
  const shape = resolveGeneratedLeafShape(layer.geometry, layer.type);
  return (
    <>
      {computeGeneratedFoliage(layer).map((leaf, index) => (
        <GeneratedLeafShape
          key={`${layer.type}-${index}`}
          shape={shape}
          x={leaf.x}
          y={leaf.y}
          rotation={leaf.rotation}
          scale={leaf.scale}
          fill={fill}
          stroke={stroke}
        />
      ))}
    </>
  );
}
