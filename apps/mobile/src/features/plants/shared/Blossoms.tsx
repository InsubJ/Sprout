import { Circle, G } from "react-native-svg";
export interface BlossomPosition {
  cx: number;
  cy: number;
  r: number;
}
export function Blossoms({
  positions,
  color = "#EAA89B",
}: {
  positions: BlossomPosition[];
  color?: string;
}) {
  return (
    <G fill={color}>
      {positions.map((item, index) => (
        <Circle key={index} cx={item.cx} cy={item.cy} r={item.r} />
      ))}
    </G>
  );
}
