import { notFound } from "next/navigation";

/**
 * Anything under a locale that matches no page.
 *
 * Without it Next falls back to its own bare 404, outside the locale layout,
 * which loses the navigation, the footer and the reader's language.
 */
export default function CatchAllPage() {
  notFound();
}
