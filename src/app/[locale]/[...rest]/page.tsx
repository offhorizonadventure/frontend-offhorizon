import { notFound } from "next/navigation";

/** Anything under a locale that matches no page. */
export default function CatchAllPage() {
  notFound();
}
