import React from "react";

interface ScarMark {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface ScarredAccentsProps {
  marks: ScarMark[];
  color?: string;
}

/** Renders dry/golden accent marks for a "scarred resilience" completed plant. */
export default function ScarredAccents({ marks, color = "#C9AE72" }: ScarredAccentsProps) {
  return (
    <g fill={color} opacity="0.75">
      {marks.map((m, i) => (
        <ellipse key={i} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
      ))}
    </g>
  );
}
