"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type FlashDealProduct = {
  id?: number | string;
  name: string;
  originalPrice?: string;
  platform?: string;
  price: string;
};

function FlashDealCard({
  className,
  product,
}: {
  className?: string;
  product: FlashDealProduct;
}) {
  return (
    <article
      className={cn(
        "group relative z-0 h-[154px] w-[min(88vw,360px)] shrink-0 overflow-hidden rounded-xl border-2 border-[#B3B3B3] bg-white font-extrabold leading-none text-[#00061E] shadow-[0_18px_45px_rgba(23,23,54,0.10)] md:h-[480px] md:w-[240px] lg:h-[590px]",
        className,
      )}
    >
      <div className="relative grid h-full grid-cols-[116px_1fr] md:hidden">
        <Link
          aria-label={`Voir les offres - ${product.name}`}
          className="absolute inset-0 z-[1]"
          href="#products"
        />

        <div className="relative h-full overflow-hidden">
          <Image
            alt={product.name}
            className="object-cover"
            fill
            priority={product.id === 1}
            sizes="116px"
            src="/jeu1.jpg"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_52%,rgba(255,255,255,0.94)_100%)]" />
        </div>

        <div className="relative z-[2] flex min-w-0 flex-col bg-white p-3 pr-14">
          <div className="mb-2 inline-flex h-8 w-fit items-center gap-2 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-2.5 text-xs font-bold uppercase leading-3 text-white">
            <Image
              alt="xbox live"
              className="size-5 brightness-0 invert"
              height={20}
              src="/xbox.png"
              width={20}
            />
            <span className="truncate">Global</span>
          </div>

          <h3 className="line-clamp-2 text-[13px] font-black leading-5 text-[#00061E]">
            {product.name}
          </h3>
          <p className="mt-1 truncate text-[11px] font-bold uppercase text-[#012D69]">
            {product.platform ?? "PlayStation Store"} · États Unis
          </p>
          <div className="mt-auto">
            <p className="font-heading text-xl font-black text-[#1F0A4D]">
              {product.price}{" "}
              <span className="font-mono text-[11px] text-black/55">TND</span>
            </p>
            {product.originalPrice ? (
              <p className="mt-0.5 font-mono text-[10px] text-black/45 line-through">
                {product.originalPrice} TND
              </p>
            ) : null}
          </div>
        </div>

        <button
          aria-label={`Ajouter au panier - ${product.name}`}
          className="absolute bottom-3 right-3 z-20 flex size-10 items-center justify-center rounded-xl bg-[#B0A4F5] text-[#1F0A4D] shadow-[0_6px_18px_rgba(176,164,245,0.34)] transition hover:bg-[#A681F0]"
          type="button"
        >
          <ShoppingCart className="size-4" />
        </button>
      </div>

      <div className="relative hidden h-full md:grid md:[grid-template-areas:'img']">
        <Link
          aria-label={`Voir les offres - ${product.name}`}
          className="absolute inset-0 z-[1] cursor-pointer"
          href="#products"
        />

        <div className="relative h-full [grid-area:img]">
          <div className="relative h-[308px] overflow-hidden transition-[clip-path] duration-500 ease-out [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(0_0_112px_0)] lg:h-[420px]">
            <Image
              alt={product.name}
              className="object-cover transition duration-500"
              fill
              priority={product.id === 1}
              sizes="(max-width: 768px) 190px, (max-width: 1024px) 230px, 25vw"
              src="/jeu1.jpg"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(255,255,255,0.96),rgba(255,255,255,0))]" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 grid translate-y-[112px] transition-transform duration-500 ease-out [grid-template-areas:'flag'_'top'_'bottom'] group-hover:translate-y-0">
          <div className="relative z-[2] h-[38px] bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-[13px] text-base font-bold uppercase leading-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] [grid-area:flag]">
            <div className="flex h-full items-center gap-2.5">
              <Image
                alt="xbox live"
                className="size-[27px] brightness-0 invert"
                height={27}
                src="/xbox.png"
                width={27}
              />
              <p>Global</p>
            </div>
          </div>
          <Link
            aria-label={`Voir les offres - ${product.name}`}
            className="absolute inset-0 z-[1]"
            href="#products"
            tabIndex={-1}
          />

          <div className="relative z-[2] grid bg-white px-4 pb-3 pt-4 [grid-area:top]">
            <div className="min-w-0">

              <h3 className="line-clamp-2 min-h-10 text-[13px] font-black leading-5 text-[#00061E]">
                {product.name}
              </h3>
              <p className="mt-2 truncate text-xs font-bold uppercase text-[#012D69]">
                États Unis
              </p>
            </div>
          </div>

          <div className="relative z-[2] flex flex-col justify-between bg-white px-4 pb-4 [grid-area:bottom]">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-black/55">Prix promo</p>
                <p className="mt-1 font-heading text-3xl font-black text-[#1F0A4D]">
                  {product.price}{" "}
                  <span className="font-mono text-[15px] text-black/55">
                    TND
                  </span>
                </p>
                {product.originalPrice ? (
                  <p className="mt-1 font-mono text-[11px] text-black/45 line-through">
                    {product.originalPrice} TND
                  </p>
                ) : null}
              </div>
            </div>

            <div className="relative z-[2] mt-4 grid gap-2">
              <button
                aria-label={`Ajouter au panier - ${product.name}`}
                className="rounded-lg bg-[#B0A4F5] px-3 py-3 text-center text-xs font-black text-[#1F0A4D] transition hover:bg-[#A681F0]"
                type="button"
              >
                Ajouter au panier
              </button>
              <Link
                aria-label={`Voir les offres - ${product.name}`}
                className="rounded-lg border border-[#B3B3B3] px-3 py-3 text-center text-xs font-black text-[#00061E] transition hover:border-[#A681F0] hover:text-[#1F0A4D]"
                href="#products"
              >
                Voir les offres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FlashDealsCarousel({
  products,
}: {
  products: readonly FlashDealProduct[];
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
    <div className="relative mt-10 overflow-hidden">
      <button
        aria-label="Offre précédente"
        className="absolute left-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#B3B3B3] bg-white/95 text-[#00061E] shadow-[0_10px_28px_rgba(23,23,54,0.16)] backdrop-blur transition hover:border-[#A681F0] hover:bg-[#B0A4F5] hover:text-[#1F0A4D] md:left-6"
        onClick={() => scrollToCard("previous")}
        type="button"
      >
        <ChevronLeft className="size-5" />
      </button>

      <div
        aria-label="Offres flash"
        className="scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-3"
        ref={scrollRef}
      >
        <div className="flex items-start gap-4">
          {carouselProducts.map((product, index) => (
            <div
              className="shrink-0 snap-start lg:basis-[calc((100%_-_3rem)_/_4)]"
              data-carousel-card
              key={product.id ?? `${product.name}-${index}`}
            >
              <FlashDealCard className="lg:w-full" product={product} />
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Offre suivante"
        className="absolute right-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#B3B3B3] bg-white/95 text-[#00061E] shadow-[0_10px_28px_rgba(23,23,54,0.16)] backdrop-blur transition hover:border-[#A681F0] hover:bg-[#B0A4F5] hover:text-[#1F0A4D] md:right-6"
        onClick={() => scrollToCard("next")}
        type="button"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
