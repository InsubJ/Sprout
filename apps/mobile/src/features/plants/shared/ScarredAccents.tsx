import { Ellipse, G } from "react-native-svg";
export interface ScarMark {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}
export function ScarredAccents({
  marks,
  color = "#C9AE72",
}: {
  marks: ScarMark[];
  color?: string;
}) {
  return (
    <G fill={color} opacity={0.75}>
      {marks.map((item, index) => (
        <Ellipse key={index} cx={item.cx} cy={item.cy} rx={item.rx} ry={item.ry} />
      ))}
    </G>
  );
}
