type FlagProps = {
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  alt?: string;
  className?: string;
};

/**
 * Country flag from flagcdn.com.
 *
 * `object-contain` inside a fixed box, not `object-cover`: flag ratios vary a
 * lot (Sri Lanka is 2:1, Nepal is a pennant), and cover was slicing the top
 * and bottom off the wider ones. Contain keeps every flag whole while the box
 * stays a constant size so rows still line up.
 *
 * Deliberately a plain <img>: these are tiny pre-optimised PNGs, so routing
 * them through the image optimizer would cost a request to save nothing.
 */
export function Flag({ country, alt, className = "" }: FlagProps) {
  const code = country.toLowerCase();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={24}
      height={16}
      loading="lazy"
      decoding="async"
      alt={alt ?? ""}
      aria-hidden={alt ? undefined : true}
      className={`inline-block h-4 w-6 shrink-0 rounded-[2px] object-contain ${className}`}
    />
  );
}
