import { Heart, Plus, Star, Zap } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { ProductPreview } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";

const badgeStyles = {
  instant:
    "border-brand-lavender/35 bg-brand-lavender/12 text-brand-lavender",
  hot: "border-danger/35 bg-danger/12 text-danger",
  sale: "border-warning/35 bg-warning/12 text-warning",
  new: "border-brand-purple-deep/35 bg-brand-purple-deep/20 text-brand-lilac-soft",
};

const badgeLabels = {
  instant: "Instant",
  hot: "Hot",
  sale: "Promo",
  new: "New",
};

export function ProductCard({
  className,
  product,
}: {
  className?: string;
  product: ProductPreview;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-3xl border border-brand-ice/14 bg-brand-navy  transition hover:-translate-y-1 hover:border-brand-lavender/45 ",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-36 items-center justify-center bg-gradient-to-br",
          product.gradient,
        )}
      >

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
          {product.badges.map((badge) => (
            <span
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase",
                badgeStyles[badge],
              )}
              key={badge}
            >
              {badge === "instant" ? <Zap className="mr-1 inline size-3" /> : null}
              {badgeLabels[badge]}
            </span>
          ))}
        </div>
        <button
          aria-label="Ajouter aux favoris"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg border border-white/15 bg-brand-navy/60 text-brand-lilac/70 transition hover:border-danger/45 hover:text-danger"
          type="button"
        >
          <Heart className="size-4" />
        </button>
        <HomeIcon
          className="relative z-10 size-14 text-white/92 transition group-hover:scale-110"
          name={product.icon}
        />
      </div>

      <div className="p-4">
        <p className="font-mono text-[10px] font-bold uppercase text-brand-periwinkle/60">
          {product.platform}
        </p>
        <h3 className="mt-1 min-h-10 font-heading text-sm font-bold leading-5 text-brand-lilac">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-periwinkle/70">
          <span className="flex text-warning">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="size-3 fill-current" key={index} />
            ))}
          </span>
          <span className="font-mono">({product.reviews})</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-base font-black text-brand-lavender">
              {product.price}{" "}
              <span className="font-mono text-[10px] text-brand-periwinkle/60">
                TND
              </span>
            </p>
            {product.originalPrice ? (
              <p className="font-mono text-[11px] text-brand-periwinkle/45 line-through">
                {product.originalPrice} TND
              </p>
            ) : null}
          </div>
          <button
            aria-label="Ajouter au panier"
            className="flex size-9 items-center justify-center rounded-xl bg-brand-light-purple text-black transition hover:bg-brand-blue-mist"
            type="button"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-brand-lavender">
          <span className="size-1.5 rounded-full bg-brand-lavender" />
          Livraison instantanée
        </p>
      </div>
    </article>
  );
}
