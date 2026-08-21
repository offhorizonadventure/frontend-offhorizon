type FlagProps = {
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  alt?: string;
  className?: string;
};

/** Country flag from flagcdn.com. */
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
