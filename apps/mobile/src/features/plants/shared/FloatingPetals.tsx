import { Ellipse, G } from "react-native-svg";
import type { FloatingPetal } from "@sprout/shared";
export function FloatingPetals({
  petals,
  color = "#F7C9E0",
}: {
  petals: FloatingPetal[];
  color?: string;
}) {
  return (
    <G fill={color}>
      {petals.map((item, index) => (
        <Ellipse
          key={index}
          cx={item.cx}
          cy={item.cy}
          rx={item.r}
          ry={item.r * 0.6}
          transform={`rotate(${item.rotation} ${item.cx} ${item.cy})`}
        />
      ))}
    </G>
  );
}
