import { Facebook, Instagram, YouTube } from "@/components/ui/icons";

export const socialLinks = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/offhorizon",
    Icon: Facebook,
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/offhorizonadventures",
    Icon: Instagram,
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@Offhorizonadvenutures",
    Icon: YouTube,
  },
] as const;
