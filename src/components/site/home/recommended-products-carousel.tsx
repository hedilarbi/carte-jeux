"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { RecommendedCard } from "@/components/site/home/RecommendedCard";
import type { ProductPreview } from "@/types/home";

export function RecommendedProductsCarousel({
  categorySlug,
  products,
}: {
  categorySlug?: string;
  products: ProductPreview[];
}) {
  const carouselProducts = useMemo(() => products.slice(0, 8), [products]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToCard = useCallback((direction: "previous" | "next") => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const cards = Array.from(scroller.querySelectorAll<HTMLElement>("[data-carousel-card]"));
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

    if (!cards.length || maxScrollLeft <= 0) {
      return;
    }

    const currentLeft = scroller.scrollLeft;

    if (direction === "next" && currentLeft >= maxScrollLeft - 4) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction === "previous" && currentLeft <= 4) {
      scroller.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const closestDistance = Math.abs(cards[closestIndex].offsetLeft - currentLeft);
      const distance = Math.abs(card.offsetLeft - currentLeft);

      return distance < closestDistance ? index : closestIndex;
    }, 0);

    const nextIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, cards.length - 1)
        : Math.max(currentIndex - 1, 0);

    scroller.scrollTo({
      left: Math.min(cards[nextIndex].offsetLeft, maxScrollLeft),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      scrollToCard("next");
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [scrollToCard]);

  return (
    <div className="relative mt-10">
      <button
        aria-label="Produit précédent"
        className="absolute left-0 top-1/2 z-30 flex size-11 -translate-x-full -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0F0F28]/90 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-brand-lavender hover:bg-brand-lavender hover:text-[#03030A]"
        onClick={() => scrollToCard("previous")}
        type="button"
      >
        <ChevronLeft className="size-5" />
      </button>

      <div
        aria-label="Produits recommandés"
        className="scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-3"
        ref={scrollRef}
      >
        <div className="flex items-start gap-4">
          {carouselProducts.map((product) => (
            <div
              className="shrink-0 snap-start lg:basis-[calc((100%_-_3rem)_/_4)]"
              data-carousel-card
              key={product.id}
            >
              <RecommendedCard
                categorySlug={categorySlug}
                className="lg:w-full"
                product={product}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Produit suivant"
        className="absolute right-0 top-1/2 z-30 flex size-11 translate-x-full -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0F0F28]/90 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-brand-lavender hover:bg-brand-lavender hover:text-[#03030A]"
        onClick={() => scrollToCard("next")}
        type="button"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
