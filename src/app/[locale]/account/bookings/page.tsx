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
            className="group ring-brand-900/8 hover:ring-brand-900/20 grid gap-5 rounded-[20px] bg-white p-4 ring-1 transition-shadow sm:grid-cols-[10rem_1fr_auto] sm:items-center"
          >
            <div className="bg-brand-100 relative aspect-[4/3] overflow-hidden rounded-[14px] sm:aspect-[4/3]">
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
                <span className="text-brand-800/45 font-mono text-[11.5px]">{booking.id}</span>
              </div>

              <h3 className="font-display text-brand-900 mt-2.5 text-[17px] leading-tight font-bold tracking-[-0.02em]">
                {booking.tour}
              </h3>

              <p className="text-brand-800/60 mt-1.5 text-[13.5px]">
                {booking.dates} · {booking.riders}
              </p>
              <p className="text-brand-800/45 mt-1 text-[13px]">{booking.balance}</p>
            </div>

            <button
              type="button"
              className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-11 items-center gap-2.5 justify-self-start rounded-full border px-5 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors sm:justify-self-auto"
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
