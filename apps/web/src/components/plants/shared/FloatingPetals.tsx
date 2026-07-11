import React from "react";
import { FloatingPetal } from "../../../utils/plantGeometry/sakuraGeometry";

interface FloatingPetalsProps {
  petals: FloatingPetal[];
  color?: string;
}

/** Renders drifting petal shapes at pre-computed positions. */
export default function FloatingPetals({ petals, color = "#F7C9E0" }: FloatingPetalsProps) {
  return (
    <g fill={color}>
      {petals.map((p, i) => (
        <ellipse
          key={i}
          cx={p.cx}
          cy={p.cy}
          rx={p.r}
          ry={p.r * 0.6}
          transform={`rotate(${p.rotation} ${p.cx} ${p.cy})`}
        />
      ))}
    </g>
  );
}
