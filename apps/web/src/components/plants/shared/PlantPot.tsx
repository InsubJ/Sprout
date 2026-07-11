import React from "react";

interface PlantPotProps {
  /** Base pot color */
  color: string;
  /** Lighter front-face color */
  colorLight: string;
  /** Darker rim/soil color */
  colorDark: string;
  /** Half-width of the pot in SVG units, default 50 (i.e. 100px wide) */
  halfWidth?: number;
}

/** Renders only the pot + rim + soil line. Colors are species-specific props, not hardcoded. */
export default function PlantPot({ color, colorLight, colorDark, halfWidth = 50 }: PlantPotProps) {
  const left = 200 - halfWidth;
  const right = 200 + halfWidth;
  const bottomLeft = 200 - halfWidth + 10;
  const bottomRight = 200 + halfWidth - 10;

  return (
    <>
      <rect x={left} y="300" width={halfWidth * 2} height="16" rx="2" fill={color} />
      <path
        d={`M${left - 10} 300 L${right + 10} 300 L${bottomRight} 340 L${bottomLeft} 340 Z`}
        fill={colorLight}
      />
      <path
        d={`M${left - 10} 300 L${right + 10} 300 L${right + 8} 308 L${left - 8} 308 Z`}
        fill={color}
      />
      <ellipse cx="200" cy="300" rx={halfWidth - 5} ry="7" fill={colorDark} opacity="0.4" />
    </>
  );
}
