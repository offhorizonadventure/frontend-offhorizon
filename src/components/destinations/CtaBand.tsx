import Image from "next/image";

import { blurOf, type ImageSource } from "@/lib/image-source";

import { ArrowRight } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

/** Closing call to action. */
export function CtaBand({
  title,
  body,
  image,
  imageAlt,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  image: ImageSource;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section className="bg-cream-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          data-anim="wipe"
          className="bg-brand-950 text-cream-100 overflow-hidden rounded-[32px]"
        >
          <div className="grid lg:grid-cols-12">
            <div className="relative order-1 min-h-[15rem] lg:order-2 lg:col-span-5 lg:min-h-[22rem]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                {...blurOf(image)}
                sizes="(max-width: 1023px) 100vw, 460px"
                quality={90}
                className="object-cover"
              />
              <span
                aria-hidden
                className="from-brand-950/85 via-brand-950/20 lg:from-brand-950 lg:via-brand-950/40 absolute inset-0 bg-gradient-to-t to-transparent lg:bg-gradient-to-r lg:to-transparent"
              />
            </div>

            <div className="order-2 p-8 sm:p-12 lg:order-1 lg:col-span-7 lg:self-center lg:p-14">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-balance">
                {title}
              </h2>
              <p className="text-cream-100/60 mt-4 max-w-md text-[15px] leading-[1.8] text-pretty">
                {body}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primary.href}
                  className="group bg-ember-500 text-brand-950 hover:bg-cream-100 inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-7 text-[11.5px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
                >
                  {primary.label}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href={secondary.href}
                  className="border-cream-100/25 text-cream-100 hover:border-cream-100 hover:bg-cream-100/10 inline-flex h-13 items-center justify-center rounded-full border px-7 text-[11.5px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
                >
                  {secondary.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
