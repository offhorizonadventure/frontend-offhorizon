type TopoProps = {
  rings?: number;
  seed?: number;
  className?: string;
};

/**
 * One contour ring, written as moves relative to the last point.
 *
 * Every ring is seventy three points and every page draws seven rings worth of
 * this, inline, in the HTML. Written as absolute coordinates each point cost
 * four digits and a comma; written as the step from the one before it, most
 * cost one or two. Same curve, same pixels, a fifth less HTML on every page on
 * the site for decoration nobody is looking at.
 */
function contour(cx: number, cy: number, radius: number, seed: number, squash: number) {
  const steps = 72;
  let path = "";
  let lastX = 0;
  let lastY = 0;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wobble =
      1 +
      0.13 * Math.sin(3 * t + seed) +
      0.07 * Math.sin(5 * t + seed * 1.7) +
      0.04 * Math.sin(8 * t + seed * 2.6) +
      0.02 * Math.sin(13 * t + seed * 3.1);

    const r = radius * wobble;
    const x = Math.round(cx + r * squash * Math.cos(t));
    const y = Math.round(cy + r * Math.sin(t));

    path += i === 0 ? `M${x},${y}` : `l${x - lastX},${y - lastY}`;
    lastX = x;
    lastY = y;
  }

  return `${path}Z`;
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
            strokeOpacity={(1 - index / rings) * 0.55 + 0.12}
            strokeDasharray={index % 4 === 3 ? "5 7" : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
