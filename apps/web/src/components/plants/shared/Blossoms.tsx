import React from "react";

interface Blossom {
  cx: number;
  cy: number;
  r: number;
}

interface BlossomsProps {
  positions: Blossom[];
  color?: string;
}

/** Renders scattered blossom dots. Positions are passed in, not hardcoded per species. */
export default function Blossoms({ positions, color = "#EAA89B" }: BlossomsProps) {
  return (
    <g fill={color}>
      {positions.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
      ))}
    </g>
  );
}
