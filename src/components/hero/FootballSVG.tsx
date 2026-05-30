// Classic soccer-ball silhouette. Six black patches on a white circle.
// Styled flat for the USA '94 retro treatment.
export default function FootballSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Soft shadow */}
      <ellipse cx="104" cy="107" rx="80" ry="80" fill="#1C1C1C" opacity="0.10" />

      {/* Ball */}
      <circle cx="100" cy="100" r="82" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="5" />

      {/* Black patches — clipped to the ball */}
      <defs>
        <clipPath id="ball-clip">
          <circle cx="100" cy="100" r="82" />
        </clipPath>
      </defs>

      <g clipPath="url(#ball-clip)" fill="#1C1C1C">
        {/* Top centre pentagon */}
        <path d="M100 22 L124 38 L116 66 L84 66 L76 38Z" />
        {/* Upper-right pentagon */}
        <path d="M152 52 L170 78 L152 102 L124 94 L120 64Z" />
        {/* Lower-right pentagon */}
        <path d="M156 130 L144 160 L116 168 L102 146 L124 122Z" />
        {/* Lower-left pentagon */}
        <path d="M98 146 L84 168 L56 160 L44 130 L76 122Z" />
        {/* Upper-left pentagon */}
        <path d="M80 64 L76 94 L48 102 L30 78 L48 52Z" />
        {/* Centre hexagon */}
        <path d="M84 66 L116 66 L124 94 L106 116 L94 116 L76 94Z" />
      </g>

      {/* Outline on top of patches */}
      <circle cx="100" cy="100" r="82" fill="none" stroke="#1C1C1C" strokeWidth="5" />
    </svg>
  )
}
