import type { StaticImageData } from "next/image";

export type ImageSource = StaticImageData | string;

export const blurOf = (image: ImageSource) =>
  typeof image === "string" ? {} : ({ placeholder: "blur" } as const);
