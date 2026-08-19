import { DemoNote, Panel, Pill } from "@/components/account/parts";

/**
 * Sample rows.
 *
 * The receipt column is a link rather than a generated PDF: Razorpay issues a
 * receipt for every captured payment and hosts it, so linking to theirs means
 * one less document to build, store and keep correct.
 */
const PAYMENTS = [
  {
    booking: "OFH-2026-0148",
    tour: "Ladakh Motorcycle Expedition",
    date: "14 February 2026",
    amount: "$2,850",
    method: "Card ending 4242",
    status: "paid" as const,
    receipt: "rcpt_QK18fzTb2p",
  },
  {
    booking: "OFH-2026-0148",
    tour: "Ladakh Motorcycle Expedition",
    date: "3 January 2026",
    amount: "$500",
    method: "Deposit, UPI",
    status: "paid" as const,
    receipt: "rcpt_QJ92aaLm7x",
  },
  {
    booking: "OFH-2025-0091",
    tour: "Nepal Motorcycle Tour",
    date: "22 August 2025",
    amount: "$400",
    method: "Refunded to card",
    status: "refunded" as const,
    receipt: "rcpt_QC44kdRe1s",
  },
];

const head = "px-4 py-3 text-[10px] font-bold tracking-[0.14em] text-brand-800/45 uppercase";
const cell = "px-4 py-4 align-top text-[13.5px] text-brand-900/80";

export default function PaymentsPage() {
  return (
    <Panel title="My payments" lead="Every payment against your bookings, newest first.">
      <div className="overflow-x-auto rounded-[18px] ring-1 ring-brand-900/10">
        <table className="w-full min-w-[46rem] border-collapse bg-white text-left">
          <thead className="bg-brand-900/4">
            <tr>
              <th className={head}>Booking ID</th>
              <th className={head}>Tour</th>
              <th className={head}>Date</th>
              <th className={`${head} text-right`}>Amount</th>
              <th className={head}>Receipt</th>
            </tr>
          </thead>

          <tbody>
            {PAYMENTS.map((payment) => (
              <tr
                key={payment.receipt}
                className="border-t border-brand-900/8 transition-colors hover:bg-brand-900/3"
              >
                <td className={`${cell} font-mono text-[12.5px] whitespace-nowrap`}>
                  {payment.booking}
                </td>
                <td className={cell}>
                  {payment.tour}
                  <span className="mt-1 block text-[12px] text-brand-800/45">{payment.method}</span>
                </td>
                <td className={`${cell} whitespace-nowrap`}>{payment.date}</td>
                <td className={`${cell} text-right font-semibold tabular-nums whitespace-nowrap`}>
                  {payment.amount}
                  <span className="mt-1.5 block">
                    <Pill tone={payment.status}>
                      {payment.status === "paid" ? "Paid" : "Refunded"}
                    </Pill>
                  </span>
                </td>
                <td className={cell}>
                  <button
                    type="button"
                    className="text-[12.5px] font-semibold text-brand-900 underline decoration-ember-500/50 underline-offset-[3px] transition-colors hover:decoration-ember-500"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DemoNote>
        A design only screen with made up payments. Receipts would come from Razorpay, which issues
        and hosts one for every captured payment, so there is no second document to keep correct.
        Card numbers are never stored here, only the last four Razorpay reports.
      </DemoNote>
    </Panel>
  );
}
