import Image from "next/image";

import { DemoNote, Panel, Pill } from "@/components/account/parts";
import { ArrowRight } from "@/components/ui/icons";
import ladakh from "../../../../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../../../../public/tours/nepal-motorcycle-tour.jpg";

/** Sample rows. Replaced by the real thing when bookings are built. */
const BOOKINGS = [
  {
    id: "OFH-2026-0148",
    tour: "Ladakh Motorcycle Expedition",
    image: ladakh,
    dates: "11 – 22 July 2026",
    riders: "1 rider, 1 pillion",
    status: "confirmed" as const,
    balance: "Paid in full",
  },
  {
    id: "OFH-2026-0212",
    tour: "Nepal Motorcycle Tour",
    image: nepal,
    dates: "5 – 14 September 2026",
    riders: "2 riders",
    status: "pending" as const,
    balance: "Balance due 1 August",
  },
];

export default function BookingsPage() {
  return (
    <Panel title="My bookings" lead="Everything you have booked, and what is still to pay.">
      <ul className="space-y-4">
        {BOOKINGS.map((booking) => (
          <li
            key={booking.id}
            className="group grid gap-5 rounded-[20px] bg-white p-4 ring-1 ring-brand-900/8 transition-shadow hover:ring-brand-900/20 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-brand-100 sm:aspect-[4/3]">
              <Image
                src={booking.image}
                alt=""
                fill
                placeholder="blur"
                sizes="160px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <Pill tone={booking.status}>
                  {booking.status === "confirmed" ? "Confirmed" : "Awaiting balance"}
                </Pill>
                <span className="font-mono text-[11.5px] text-brand-800/45">{booking.id}</span>
              </div>

              <h3 className="font-display mt-2.5 text-[17px] leading-tight font-bold tracking-[-0.02em] text-brand-900">
                {booking.tour}
              </h3>

              <p className="mt-1.5 text-[13.5px] text-brand-800/60">
                {booking.dates} · {booking.riders}
              </p>
              <p className="mt-1 text-[13px] text-brand-800/45">{booking.balance}</p>
            </div>

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2.5 justify-self-start rounded-full border border-brand-900/20 px-5 text-[10.5px] font-bold tracking-[0.12em] text-brand-800 uppercase transition-colors hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 sm:justify-self-auto"
            >
              View
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </li>
        ))}
      </ul>

      <DemoNote>
        A design only screen. These two bookings are made up, and the View button does not go
        anywhere yet.
      </DemoNote>
    </Panel>
  );
}
