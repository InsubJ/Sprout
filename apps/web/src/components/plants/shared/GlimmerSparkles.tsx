import React from "react";
import { GlimmerSparkle } from "../../../utils/mythicalGlimmer";

interface GlimmerSparklesProps {
  sparkles: GlimmerSparkle[];
  color?: string;
}

/** Renders mythical-tier shimmer sparkles at pre-computed positions. */
export default function GlimmerSparkles({ sparkles, color = "#F5D97A" }: GlimmerSparklesProps) {
  return (
    <g fill={color}>
      {sparkles.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} opacity={s.opacity} />
      ))}
    </g>
  );
}
