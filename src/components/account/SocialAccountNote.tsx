import { Panel } from "@/components/account/parts";
import { FacebookMark, GoogleMark } from "@/components/ui/BrandMarks";

const NAMES: Record<string, string> = { google: "Google", facebook: "Facebook" };

export function SocialAccountNote({ providers }: { providers: string[] }) {
  const named = providers.map((provider) => NAMES[provider] ?? provider);

  return (
    <Panel title="Sign in" lead="How you get into this account.">
      <div className="flex flex-wrap items-center gap-3">
        {providers.map((provider) => (
          <span
            key={provider}
            className="border-brand-900/12 text-brand-900 inline-flex items-center gap-2.5 rounded-full border bg-white px-4 py-2.5 text-[13.5px] font-semibold"
          >
            {provider === "google" ? (
              <GoogleMark className="size-[18px]" />
            ) : (
              <FacebookMark className="size-[18px]" />
            )}
            {NAMES[provider] ?? provider}
          </span>
        ))}
      </div>

      <p className="text-brand-800/60 mt-5 max-w-prose text-[13.5px] leading-[1.75]">
        There is no password on this account, so there is nothing to change here. Your password is
        held by {named.join(" and ")}, and is changed there.
      </p>
    </Panel>
  );
}
