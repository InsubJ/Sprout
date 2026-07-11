import React from "react";

interface GroundShadowProps {
  rx?: number;
  ry?: number;
}

/** Renders only the soft ground shadow beneath a plant's pot. */
export default function GroundShadow({ rx = 95, ry = 14 }: GroundShadowProps) {
  return <ellipse cx="200" cy="345" rx={rx} ry={ry} fill="#1B3B2B" opacity="0.15" />;
}
