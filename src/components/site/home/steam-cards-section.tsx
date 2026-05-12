import { steamCards } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { SectionHeading } from "@/components/site/home/section-heading";
import { cn } from "@/lib/utils/cn";

export function SteamCardsSection() {
  return (
    <section className="bg-[#E1D0FF]/65 py-16 ">
      <div className=" mx-auto max-w-[1400px] lg:ml-[100px] lg:mr-[50px] px-6">
        <SectionHeading
          actionHref="#products"
          actionLabel="Voir Steam"
          eyebrow="// Gift cards"
          title="Cartes Steam"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steamCards.map((card) => (
            <article
              className={cn(
                "group relative flex min-h-40 items-end overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-[0_18px_60px_rgba(1,20,58,0.34)] transition hover:-translate-y-1",
                card.gradient,
              )}
              key={card.name}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,12,38,0.88),transparent_62%)]" />
              <HomeIcon
                className="absolute right-5 top-1/2 size-20 -translate-y-1/2 text-white/18 transition group-hover:scale-110"
                name={card.icon}
              />
              <span className="absolute left-5 top-5 rounded-md border border-brand-lavender/40 bg-brand-navy/45 px-3 py-1 font-mono text-[10px] font-bold uppercase text-brand-lavender">
                {card.badge}
              </span>
              <div className="relative">
                <h3 className="font-heading text-base font-bold text-white">
                  {card.name}
                </h3>
                <p className="mt-1 font-mono text-sm font-bold text-brand-lavender">
                  {card.price} TND
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
