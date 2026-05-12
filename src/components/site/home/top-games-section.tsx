import { topGames } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { SectionHeading } from "@/components/site/home/section-heading";
import { cn } from "@/lib/utils/cn";

const rankTone = {
  1: "text-warning",
  2: "text-brand-violet-mist",
  3: "text-brand-orchid",
};

export function TopGamesSection() {
  return (
    <section className="bg-[#E1D0FF]/65 py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          actionHref="#products"
          actionLabel="Voir tout"
          eyebrow="// Classement"
          title="Meilleurs jeux"
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topGames.map((game) => (
            <article
              className="group box-border flex min-h-[76px] w-full max-w-full items-center gap-2 overflow-hidden rounded-xl border border-white/7 bg-[#0F0F28] px-3 py-3 transition hover:-translate-y-0.5 hover:border-brand-lavender/45 sm:gap-3 sm:px-[14px]"
              key={game.rank}
            >
              <span
                className={cn(
                  "w-9 shrink-0 text-center font-heading text-xl font-black text-brand-periwinkle/55 sm:w-12 sm:text-2xl",
                  rankTone[game.rank as keyof typeof rankTone],
                )}
              >
                {String(game.rank).padStart(2, "0")}
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lavender/12 text-brand-lavender sm:size-12 sm:rounded-2xl">
                <HomeIcon className="size-5 sm:size-6" name={game.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-brand-lilac">
                  {game.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-brand-periwinkle/55">
                  {game.platform}
                </p>
              </div>
              <p className="ml-auto max-w-[72px] shrink text-right font-heading text-xs font-bold leading-tight text-brand-lavender sm:max-w-none sm:shrink-0 sm:text-sm">
                {game.price} TND
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
