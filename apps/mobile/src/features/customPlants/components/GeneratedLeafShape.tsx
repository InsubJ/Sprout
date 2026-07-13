import { G, Path } from "react-native-svg";
import type { GeneratedLeafShape as LeafShape } from "@sprout/shared";

const leafPaths: Record<LeafShape, string> = {
  oval: "M0 -16 C13 -14 18 -3 12 7 C8 14 2 17 0 18 C-2 17 -8 14 -12 7 C-18 -3 -13 -14 0 -16 Z",
  lanceolate: "M0 -21 C8 -12 9 4 0 21 C-9 4 -8 -12 0 -21 Z",
  heart: "M0 19 C-5 10 -18 4 -17 -8 C-16 -19 -4 -21 0 -11 C4 -21 16 -19 17 -8 C18 4 5 10 0 19 Z",
  round: "M0 -15 C13 -15 18 -6 16 5 C14 15 5 18 -3 16 C-14 13 -18 4 -14 -7 C-11 -14 -5 -16 0 -15 Z",
  eucalyptus: "M-3 -17 C10 -14 16 -4 13 7 C10 17 -2 20 -10 13 C-18 5 -15 -9 -3 -17 Z",
  needle: "M0 -23 C5 -10 5 8 0 23 C-5 8 -5 -10 0 -23 Z",
};

export function GeneratedLeafShape({
  shape,
  x,
  y,
  rotation,
  scale,
  fill,
  stroke,
}: {
  shape: LeafShape;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  fill: string;
  stroke: string;
}): React.JSX.Element {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      <Path d={leafPaths[shape]} fill={fill} stroke={stroke} strokeWidth={1.4 / scale} />
      <Path
        d="M0 15 Q1 1 0 -12"
        fill="none"
        stroke={stroke}
        strokeWidth={1 / scale}
        opacity={0.38}
        strokeLinecap="round"
      />
    </G>
  );
}
