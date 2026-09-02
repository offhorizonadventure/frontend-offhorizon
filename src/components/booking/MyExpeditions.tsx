import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Panel, Pill } from "@/components/account/parts";
import { DatesDrawer } from "@/components/tour/DatesDrawer";
import { ArrowRight } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { buildBooking } from "@/lib/booking-props";
import type { BookingRow } from "@/lib/booking/read";
import { imageUrl, listMyExpeditions } from "@/lib/catalogue";
import { departureList, factList, pricing } from "@/lib/tour-view";

/**
 * The expeditions built for one rider, as cards they can act on.
 *
 * These used to be a line of text linking to the public tour page, which is
 * the one page that cannot do anything for them: it sells the tour to
 * strangers, and a custom expedition is already theirs. What they came here to
 * do is say how many are riding and pay for it. So a card that has been booked
 * opens the booking, and one that has not opens the same wizard the site uses,
 * on this departure and no other. Nothing points at the tour any more.
 */
export async function MyExpeditions({
  locale,
  bookings,
}: {
  locale: Locale;
  bookings: BookingRow[];
}) {
  const dated = await listMyExpeditions();
  if (!dated.length) return null;

  const t = await getTranslations({ locale, namespace: "bookings" });
  const tc = await getTranslations({ locale, namespace: "bookings.custom" });
  const tp = await getTranslations({ locale, namespace: "tour.price" });

  const dates = (start: string, end: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));

  // One card to a departure, because a departure is what gets paid for. A
  // cancelled booking must not claim the card: the rider can book it again.
  const booked = new Map(
    bookings
      .filter((booking) => booking.departure_id && booking.status !== "cancelled")
      .map((booking) => [booking.departure_id as string, booking]),
  );

  const cards = await Promise.all(
    dated.flatMap(({ tour, departures }) =>
      departures.map(async (departure) => ({
        key: departure.id,
        tour,
        departure,
        booking: booked.get(departure.id) ?? null,
        hero: imageUrl(tour.hero_path),
        // Priced from this departure alone, so the wizard quotes the rider
        // what their own expedition costs rather than the tour's cheapest date.
        wizard: await buildBooking({
          locale,
          pricing: pricing(tour, [departure]),
          tourName: tour.title,
          facts: factList(tour),
          departures: departureList([departure]),
        }),
      })),
    ),
  );

  return (
    <Panel title={tc("title")} lead={tc("lead")}>
      <ul className="space-y-4">
        {cards.map((card) => {
          const inner = (
            <>
              <div className="bg-brand-100 relative aspect-[4/3] overflow-hidden rounded-[14px]">
                {card.hero ? (
                  <Image
                    src={card.hero}
                    alt={card.tour.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Pill tone="pending">{tc("tag")}</Pill>
                  {card.booking && (
                    <span className="text-brand-800/45 font-mono text-[11.5px]">
                      {card.booking.reference}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-brand-900 mt-2.5 text-[17px] leading-tight font-bold tracking-[-0.02em]">
                  {card.tour.title}
                </h3>

                <p className="text-brand-800/60 mt-1.5 text-[13.5px]">
                  {dates(card.departure.start_date, card.departure.end_date)}
                </p>

                <p className="text-brand-800/45 mt-1 text-[13px]">
                  {card.booking
                    ? card.departure.kind === "4x4"
                      ? t("partyPeople", { people: card.booking.riders })
                      : t("party", {
                          riders: card.booking.riders,
                          pillions: card.booking.pillions,
                        })
                    : tc("choose")}
                </p>
              </div>
            </>
          );

          const shell =
            "group ring-brand-900/8 hover:ring-brand-900/20 grid gap-5 rounded-[20px] bg-white p-4 ring-1 transition-shadow sm:grid-cols-[10rem_1fr_auto] sm:items-center";

          const cta =
            "border-brand-900/20 text-brand-800 group-hover:border-brand-800 group-hover:bg-brand-800 group-hover:text-cream-100 inline-flex h-11 items-center gap-2.5 justify-self-start rounded-full border px-5 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors sm:justify-self-auto";

          return (
            <li key={card.key}>
              {card.booking ? (
                <Link href={`/account/bookings/${card.booking.reference}`} className={shell}>
                  {inner}
                  <span className={cta}>
                    {t("view")}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              ) : (
                <div className={shell}>
                  {inner}
                  {/* Not a link: the wizard opens in place, because the riders
                      and the extras have to be chosen before there is anything
                      to pay for. It ends at the same checkout as the site. */}
                  <DatesDrawer
                    label={tc("book")}
                    title={tp("datesTitle")}
                    booking={card.wizard}
                    className={`${cta} cursor-pointer`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
