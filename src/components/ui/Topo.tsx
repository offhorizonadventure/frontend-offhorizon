/** Procedural topographic contours. */

type TopoProps = {
  /** Number of nested contour lines. */
  rings?: number;
  /** Base seed. Change it for a different landform. */
  seed?: number;
  className?: string;
};

function contour(cx: number, cy: number, radius: number, seed: number, squash: number) {
  const steps = 140;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wobble =
      1 +
      0.13 * Math.sin(3 * t + seed) +
      0.07 * Math.sin(5 * t + seed * 1.7) +
      0.04 * Math.sin(8 * t + seed * 2.6) +
      0.02 * Math.sin(13 * t + seed * 3.1);

    const r = radius * wobble;
    points.push(
      `${(cx + r * squash * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`,
    );
  }

  return `M${points.join("L")}Z`;
}

export function Topo({ rings = 16, seed = 1.4, className = "" }: TopoProps) {
  const paths: { d: string; index: number }[] = [];

  for (let i = 0; i < rings; i++) {
    paths.push({
      d: contour(600, 400, 26 + i * 27, seed + i * 0.09, 1.55),
      index: i,
    });
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {paths.map(({ d, index }) => (
          <path
            key={index}
            d={d}
            // Inner rings sit closer to the peak, so they read slightly stronger.
            strokeOpacity={(1 - index / rings) * 0.55 + 0.12}
            strokeDasharray={index % 4 === 3 ? "5 7" : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
