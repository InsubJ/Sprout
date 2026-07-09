import React from "react";

/** Renders a 3D-styled wooden plant stool to support hanging plants. */
export default function PlantStool() {
  return (
    <g id="plant-stool" data-testid="plant-stool">
      {/* Back leg (shadowed) */}
      <line
        x1="200"
        y1="248"
        x2="192"
        y2="335"
        stroke="#6B4A2F"
        strokeWidth="7"
        strokeLinecap="round"
      />
      
      {/* Crossbar bracing */}
      <line
        x1="175"
        y1="295"
        x2="225"
        y2="295"
        stroke="#6B4A2F"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Front left leg */}
      <line
        x1="170"
        y1="248"
        x2="160"
        y2="345"
        stroke="#8B6F47"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Front right leg */}
      <line
        x1="230"
        y1="248"
        x2="240"
        y2="345"
        stroke="#8B6F47"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Stool seat top surface */}
      <rect
        x="150"
        y="240"
        width="100"
        height="10"
        rx="3"
        fill="#A9835A"
      />
      {/* Rim line for depth */}
      <rect
        x="150"
        y="247"
        width="100"
        height="3"
        rx="1"
        fill="#8B6F47"
      />
    </g>
  );
}
