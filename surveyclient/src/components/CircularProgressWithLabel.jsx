import React from "react";
import "../App.css";

export default function CircularProgressWithLabel({ value, tooltip, label }) {
  const SIZE = 45;
  const THICKNESS = 3;
  const RADIUS = (SIZE - THICKNESS) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const CIRCLE_INACTIVE_COLOUR = "#807D7D";
  const CIRCLE_ACTIVE_COLOUR = "#afcd4b";

  return (
    <div
      className="nav-menu-item-progress"
      aria-labelledby={tooltip}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      style={{
        display: "flex",
        width: SIZE,
        height: SIZE,
      }}
    >
      <svg viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`}>
        <title>{tooltip}</title>
        <circle
          stroke={CIRCLE_INACTIVE_COLOUR}
          fill="white"
          r={RADIUS}
          strokeWidth={THICKNESS}
        />
        <g transform="rotate(-90)">
          <circle
            stroke={CIRCLE_ACTIVE_COLOUR}
            fill="none"
            strokeDasharray={CIRCUMFERENCE.toFixed(1)}
            strokeDashoffset={
              (((100 - value) / 100) * CIRCUMFERENCE).toFixed(1) + "px"
            }
            r={RADIUS}
            strokeWidth={THICKNESS}
          />
        </g>
        <text dominantBaseline="middle" textAnchor="middle">
          {label}
        </text>
      </svg>
    </div>
  );
}
