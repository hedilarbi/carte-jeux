import Link from "next/link";
import { ArrowRight, Flame, TicketPercent } from "lucide-react";

export function PromoBannerSection() {
  return (
    <section className="bg-brand-navy py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand-lavender/25 bg-[linear-gradient(135deg,rgba(130,88,203,0.26),rgba(99,146,255,0.18))] p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-9">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-brand-lavender/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger/12 px-3 py-1 font-mono text-[11px] font-bold uppercase text-danger">
              <Flame className="size-3" />
              Offre spéciale
            </span>
            <h2 className="mt-4 font-heading text-2xl font-black text-brand-lilac md:text-3xl">
              Ramadan Gaming Sale
            </h2>
            <p className="mt-2 max-w-xl leading-7 text-brand-periwinkle">
              -15% sur les recharges Free Fire et PUBG ce weekend, avec
              livraison rapide et paiement en TND.
            </p>
          </div>

          <div className="relative mt-6 flex flex-col gap-4 md:mt-0 md:flex-row md:items-center">
            <div className="rounded-2xl border border-dashed border-brand-lavender/45 bg-brand-navy/45 px-6 py-4 text-center">
              <p className="font-heading text-xl font-black tracking-[0.22em] text-brand-lavender">
                RAMADAN15
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase text-brand-periwinkle/60">
                Code promo
              </p>
            </div>
            <Link
              className="font-cta inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-lavender/45 px-5 py-3 text-sm font-bold uppercase text-brand-lavender transition hover:bg-brand-lavender/10"
              href="#products"
            >
              Profiter
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <TicketPercent className="absolute bottom-5 right-6 hidden size-12 text-brand-lavender/20 lg:block" />
        </div>
      </div>
    </section>
  );
}
