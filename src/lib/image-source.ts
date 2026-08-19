import type { StaticImageData } from "next/image";

/**
 * Either a bundled import or a URL from storage.
 *
 * Static imports carry width, height and a blur placeholder; a remote URL
 * carries none of those, so `blurOf` only asks for a placeholder when the
 * source can provide one.
 */
export type ImageSource = StaticImageData | string;

export const blurOf = (image: ImageSource) =>
  typeof image === "string" ? {} : ({ placeholder: "blur" } as const);
