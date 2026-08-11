import { Facebook, Instagram, YouTube } from "@/components/ui/icons";

/**
 * TODO: replace with the real Offhorizon account URLs before launch.
 * These are placeholders based on the brand name.
 */
export const socialLinks = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/offhorizon", Icon: Facebook },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/offhorizon",
    Icon: Instagram,
  },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@Offhorizonadvenutures", Icon: YouTube },
] as const;
