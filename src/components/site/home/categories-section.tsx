"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { categories as fallbackCategories } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { cn } from "@/lib/utils/cn";
import { buildProductsHref } from "@/lib/utils/catalog-links";
import type { HomeCategoryPreview } from "@/types/home";

export function CategoriesSection({
  categories = fallbackCategories.map((category, index) => ({
    id: category.label,
    label: category.label,
    slug: category.label.toLowerCase(),
    isPlateforme: index > 0,
    sortOrder: index + 1,
  })),
}: {
  categories?: HomeCategoryPreview[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollToCategory = useCallback((direction: "previous" | "next") => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const cards = Array.from(
      slider.querySelectorAll<HTMLElement>("[data-category-card]"),
    );
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

    if (!cards.length || maxScrollLeft <= 0) {
      return;
    }

    const currentLeft = slider.scrollLeft;

    if (direction === "next" && currentLeft >= maxScrollLeft - 4) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction === "previous" && currentLeft <= 4) {
      slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
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

    slider.scrollTo({
      left: Math.min(cards[nextIndex].offsetLeft, maxScrollLeft),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      scrollToCategory("next");
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [scrollToCategory]);

  return (
    <section className="bg-brand-light py-8" id="categories">
      <div className="mx-auto max-w-[1350px] px-6">
        <div className="mb-7">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-purple-deep">
            {"// Plateformes"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
            Toutes les catégories
          </h2>
        </div>

        <div className="relative">
          <button
            aria-label="Catégories précédentes"
            className="absolute left-0 top-1/2 z-20 hidden size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#B3B3B3] bg-white/95 text-[#00061E] shadow-[0_10px_28px_rgba(23,23,54,0.16)] transition hover:border-[#A681F0] hover:bg-[#B0A4F5] hover:text-[#1F0A4D] md:flex"
            onClick={() => scrollToCategory("previous")}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            className="scrollbar-none -mx-6 snap-x snap-mandatory overflow-x-auto scroll-smooth px-6 pb-2"
            ref={sliderRef}
          >
            <div className="flex items-center gap-8">
              {categories.map((category, index) => (
                <a
                  className={cn(
                    "flex min-w-[82px] shrink-0 snap-start flex-col items-center gap-2 text-center transition hover:-translate-y-1",
                    index === 0 && "text-brand-purple-deep",
                  )}
                  data-category-card
                  href={buildProductsHref(category.slug)}
                  key={category.id}
                >
                  {category.image ? (
                    <span className="relative size-10 overflow-hidden">
                      <Image
                        alt={category.label}
                        className="object-contain"
                        fill
                        sizes="40px"
                        src={category.image}
                      />
                    </span>
                  ) : (
                    <HomeIcon
                      className="size-8 text-brand-dark transition group-hover:scale-110"
                      name={
                        fallbackCategories.find(
                          (fallbackCategory) =>
                            fallbackCategory.label.toLowerCase() ===
                            category.label.toLowerCase(),
                        )?.icon ?? "Gamepad2"
                      }
                    />
                  )}
                  <span className="font-heading text-xs font-bold text-brand-dark">
                    {category.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <button
            aria-label="Catégories suivantes"
            className="absolute right-0 top-1/2 z-20 hidden size-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#B3B3B3] bg-white/95 text-[#00061E] shadow-[0_10px_28px_rgba(23,23,54,0.16)] transition hover:border-[#A681F0] hover:bg-[#B0A4F5] hover:text-[#1F0A4D] md:flex"
            onClick={() => scrollToCategory("next")}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
