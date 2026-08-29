"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Panel } from "@/components/account/parts";
import { Close } from "@/components/ui/icons";
import { deleteMyAccount, type DeleteState } from "@/lib/account/delete";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const [state, formAction] = useActionState<DeleteState, FormData>(deleteMyAccount, {
    ok: false,
    message: null,
  });

  const armed = typed.trim().toUpperCase() === "DELETE";

  return (
    <Panel
      title="Delete my account"
      lead="Removes your profile, your enquiries and your booking history."
    >
      <div className="rounded-[18px] border border-red-600/25 bg-red-600/5 p-5">
        <p className="text-brand-900/75 text-[13.5px] leading-[1.75]">
          Deleting is permanent. Bookings that are already paid for stay on our side as financial
          records, because we are required to keep those; everything else goes, and you will need a
          new account to book again.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 h-11 rounded-full border border-red-600/40 px-6 text-[11px] font-bold tracking-[0.12em] text-red-700 uppercase transition-colors hover:bg-red-600 hover:text-white"
        >
          Delete my account
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-9999 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <div
            onClick={() => setOpen(false)}
            className="animate-fade-in bg-brand-950/60 absolute inset-0 backdrop-blur-md"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="animate-modal-in bg-paper relative w-full max-w-md rounded-t-[28px] p-6 sm:rounded-[28px] sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-brand-800/50 hover:bg-brand-900/6 hover:text-brand-900 absolute top-5 right-5 grid size-9 place-items-center rounded-full transition-colors"
            >
              <Close />
            </button>

            <h2
              id="delete-account-title"
              className="font-display text-brand-900 text-[20px] leading-tight font-extrabold tracking-[-0.03em]"
            >
              Delete your account?
            </h2>

            <p className="text-brand-800/65 mt-3 text-[13.5px] leading-[1.75]">
              This cannot be undone. Type <strong className="text-brand-900">DELETE</strong> to
              confirm.
            </p>

            <form action={formAction}>
              <input
                name="confirm"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder="DELETE"
                className="border-brand-900/15 text-brand-900 mt-5 h-12 w-full rounded-xl border bg-white px-4 text-[14px] tracking-[0.1em] uppercase outline-none focus:border-red-600 focus:ring-[3px] focus:ring-red-600/10"
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border-brand-900/20 text-brand-800 hover:bg-brand-900/5 h-12 flex-1 rounded-full border text-[11px] font-bold tracking-[0.12em] uppercase transition-colors"
                >
                  Keep my account
                </button>

                <Submit armed={armed} />
              </div>

              {state.message && (
                <p
                  role="alert"
                  className={`mt-4 rounded-xl px-4 py-3 text-[13px] leading-[1.7] ${
                    state.ok ? "bg-brand-900/5 text-brand-900" : "bg-red-600/10 text-red-700"
                  }`}
                >
                  {state.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Submit({ armed }: { armed: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!armed || pending}
      className="h-12 flex-1 rounded-full bg-red-600 text-[11px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-40"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
