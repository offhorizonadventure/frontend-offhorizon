import type { StaticImageData } from "next/image";

/** Either a bundled import or a URL from storage. */
export type ImageSource = StaticImageData | string;

export const blurOf = (image: ImageSource) =>
  typeof image === "string" ? {} : ({ placeholder: "blur" } as const);
