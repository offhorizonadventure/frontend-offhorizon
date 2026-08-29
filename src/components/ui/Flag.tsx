type FlagProps = {
  country: string;
  alt?: string;
  className?: string;
};

const REGIONS = new Intl.DisplayNames(["en"], { type: "region" });

const nameOf = (code: string) => {
  try {
    return REGIONS.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

export function Flag({ country, alt, className = "" }: FlagProps) {
  const code = country.toLowerCase();
  const label = alt ?? nameOf(code);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={24}
      height={16}
      loading="lazy"
      decoding="async"
      // Menu decoration. It must never compete with the page itself for a slow
      // connection.
      fetchPriority="low"
      alt={label}
      className={`inline-block h-4 w-6 shrink-0 rounded-[2px] object-contain ${className}`}
    />
  );
}
