import type { StaticImageData } from "next/image";

import motorcycle from "../../public/expeditions/motorcycle.jpg";
import selfDrive from "../../public/expeditions/self-drive.jpg";

export type Experience = {
  key: "motorcycle" | "selfDrive";
  href: string;
  image: StaticImageData;
};

/** The two formats every expedition is offered in. Order sets the 01 / 02 index. */
export const experiences: Experience[] = [
  { key: "motorcycle", href: "/adventure-tours?format=motorcycle", image: motorcycle },
  { key: "selfDrive", href: "/adventure-tours?format=self-drive", image: selfDrive },
];
