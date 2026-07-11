import React from "react";

interface FlawlessAuraProps {
  color?: string;
}

/** Glowing ring shown only around a completed, flawless-bloom plant. */
export default function FlawlessAura({ color = "#EAA89B" }: FlawlessAuraProps) {
  return (
    <>
      <circle cx="200" cy="190" r="150" fill={color} opacity="0.12" />
      <circle
        cx="200"
        cy="190"
        r="130"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3 5"
        opacity="0.5"
      />
    </>
  );
}
