"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const heroCards = [
  {
    alt: "Minecraft",
    height: 354,
    href: "/produits/minecraft-java-edition-pc",
    src: "/minecraft-card.png",
    width: 625,
  },
  {
    alt: "EA Sports FC 26",
    height: 240,
    href: "/produits/fc-26-ps4-ps5",
    src: "/fc26-card.png",
    width: 423,
  },
  {
    alt: "Grand Theft Auto V",
    height: 355,
    href: "/produits/gta-v-ps4-ps5-bundle",
    src: "/gtav-card.png",
    width: 625,
  },
  {
    alt: "Red Dead Redemption",
    height: 361,
    href: "/produits/red-dead-redemption-2-pc",
    src: "/rdd-card.png",
    width: 633,
  },
];

type ProductGridHeroSlide = {
  background: string;
  id: string;
  kind: "product-grid";
};

type ImageLinkHeroSlide = {
  alt: string;
  href: string;
  id: string;
  image: string;
  kind: "image-link";
  mobileImage?: string;
};

type ImageCtaHeroSlide = {
  alt: string;
  ctaLabel: string;
  href: string;
  id: string;
  image: string;
  kind: "image-cta";
  mobileImage: string;
};

type PsPlusHeroSlide = {
  background: string;
  id: string;
  kind: "ps-plus";
};

type HeroSlide =
  | ProductGridHeroSlide
  | ImageLinkHeroSlide
  | ImageCtaHeroSlide
  | PsPlusHeroSlide;

const psPlusCards = [
  {
    alt: "PlayStation Plus Global",
    height: 256,
    src: "/psnhero1.png",
    width: 207,
  },
  {
    alt: "PlayStation Plus 12 mois",
    height: 256,
    src: "/psnhero2.png",
    width: 208,
  },
  {
    alt: "Carte PlayStation Plus",
    height: 256,
    src: "/psnhero3.png",
    width: 207,
  },
  {
    alt: "Abonnement PlayStation Plus",
    height: 256,
    src: "/psnhero4.png",
    width: 208,
  },
];

const slideIntervalMs = 6500;
const swipeThresholdPx = 48;

type SwipePoint = {
  x: number;
  y: number;
};

const heroSlides: HeroSlide[] = [
  {
    alt: "EA Sports FC 26",
    ctaLabel: "J'EN PROFITE",
    href: "/produits/fc-26-ps4-ps5",
    id: "fc-26",
    image: "/fc-26-banner.jpg",
    kind: "image-cta",
    mobileImage: "/fc-26-banner-mobile.jpg",
  },
  {
    alt: "Précommande GTA VI",
    href: "/precommande-gta-vi",
    id: "precommande-gta-vi",
    image: "/banner-tga6.jpg",
    kind: "image-link",
    mobileImage: "/hero_2_mobile.jpg",
  },
  {
    background: "/banner-bg-2.png",
    id: "examens-ete",
    kind: "product-grid",
  },
  {
    background: "/hero.jpg",
    id: "ps-plus-global",
    kind: "ps-plus",
  },
];

export function HeroSection() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const swipeStartRef = useRef<SwipePoint | null>(null);
  const swipeCurrentRef = useRef<SwipePoint | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressClickTimeoutRef = useRef<number | null>(null);
  const hasMultipleSlides = heroSlides.length > 1;
  const trustItems = [
    {
      title: "Livraison instantanée",
      description: "Codes en <2 min",
      icon: Clock3,
    },
    {
      title: "Paiement sécurisé",
      description: "D17, Flouci, e-Dinar",
      icon: ShieldCheck,
    },
    {
      title: "Support 24/7",
      description: "WhatsApp et email",
      icon: Headphones,
    },
    {
      title: "100% authentique",
      description: "Codes officiels garantis",
      icon: BadgeCheck,
    },
  ];

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveSlideIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, slideIntervalMs);

    return () => window.clearTimeout(timeout);
  }, [activeSlideIndex, hasMultipleSlides, isPaused]);

  useEffect(() => {
    return () => {
      if (suppressClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressClickTimeoutRef.current);
      }
    };
  }, []);

  function goToSlide(index: number) {
    setActiveSlideIndex(index);
  }

  function goToPreviousSlide() {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === 0 ? heroSlides.length - 1 : currentIndex - 1,
    );
  }

  function goToNextSlide() {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
    );
  }

  function suppressNextClick() {
    suppressNextClickRef.current = true;

    if (suppressClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressClickTimeoutRef.current);
    }

    suppressClickTimeoutRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = false;
      suppressClickTimeoutRef.current = null;
    }, 350);
  }

  function resetSwipe() {
    swipeStartRef.current = null;
    swipeCurrentRef.current = null;
    setIsPaused(false);
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (!hasMultipleSlides) {
      return;
    }

    const touch = event.touches[0];

    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    swipeCurrentRef.current = null;
    setIsPaused(true);
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (!swipeStartRef.current) {
      return;
    }

    const touch = event.touches[0];

    swipeCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const swipeStart = swipeStartRef.current;
    const finalTouch = event.changedTouches[0];
    const swipeEnd =
      swipeCurrentRef.current ??
      (finalTouch
        ? {
          x: finalTouch.clientX,
          y: finalTouch.clientY,
        }
        : null);

    if (!swipeStart || !swipeEnd) {
      resetSwipe();
      return;
    }

    const deltaX = swipeEnd.x - swipeStart.x;
    const deltaY = swipeEnd.y - swipeStart.y;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= swipeThresholdPx &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (isHorizontalSwipe) {
      suppressNextClick();

      if (deltaX < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
    }

    resetSwipe();
  }

  function handleSlideClickCapture(event: MouseEvent<HTMLElement>) {
    if (!suppressNextClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressNextClickRef.current = false;
  }

  return (
    <div>
      <section
        className="relative isolate mt-6 touch-pan-y overflow-hidden"
        id="home"
        onClickCapture={handleSlideClickCapture}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchCancel={resetSwipe}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
      >
        <div
          className="flex h-[95svh] max-h-[95svh] transition-transform duration-700 ease-in-out sm:h-[75svh] sm:max-h-[75svh]"
          style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div
              className="relative isolate h-full min-w-full overflow-hidden"
              key={slide.id}
            >
              {slide.kind === "product-grid" ? (
                <ProductGridSlide slide={slide} />
              ) : slide.kind === "image-cta" ? (
                <ImageCtaSlide slide={slide} />
              ) : slide.kind === "image-link" ? (
                <ImageLinkSlide slide={slide} />
              ) : (
                <PsPlusSlide slide={slide} />
              )}
            </div>
          ))}
        </div>

        {hasMultipleSlides ? (
          <>
            <button
              aria-label="Slide précédent"
              className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#012D69] shadow-lg transition hover:bg-white lg:flex"
              onClick={goToPreviousSlide}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Slide suivant"
              className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#012D69] shadow-lg transition hover:bg-white lg:flex"
              onClick={goToNextSlide}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  aria-label={`Afficher le slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition ${index === activeSlideIndex
                    ? "w-8 bg-[#78DAFF]"
                    : "w-2.5 bg-white/70 hover:bg-white"
                    }`}
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <div className="w-full bg-brand-navy/88">
        <div className="mx-auto grid max-w-[1350px] justify-between px-6 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map((item) => (
            <div className="flex items-center gap-4 py-5 md:px-6" key={item.title}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-lavender/20 bg-brand-lavender text-black">
                <item.icon className="size-5" />
              </span>
              <div>
                <h2 className="font-body text-sm font-bold text-white">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-white">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductGridSlide({ slide }: { slide: ProductGridHeroSlide }) {
  return (
    <>
      <Image
        alt=""
        className="-z-10 object-cover"
        fill
        priority
        sizes="100vw"
        src={slide.background}
      />

      <div className="mx-auto grid h-full max-h-full max-w-[1350px] items-center gap-5 overflow-hidden px-6 py-5 sm:gap-6 sm:py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-12 lg:py-8">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:pl-12 xl:pl-16">
          <h1 className="font-heading text-2xl font-black leading-tight tracking-[0.03em] text-[#78DAFF] drop-shadow-[0_4px_18px_rgba(1,45,105,0.32)] sm:text-4xl lg:text-3xl">
            EXAMENS : TERMINÉ{" "}
            <span>&gt;&gt;</span> MANETTE : EN MAIN
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base font-semibold leading-7 text-white sm:mt-4 sm:text-2xl sm:leading-9">
            Découvrez les jeux PlayStation à ne pas manquer cet été !
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#78DAFF] px-3 font-body text-xs font-bold uppercase text-[#012D69] shadow-[0_10px_24px_rgba(1,45,105,0.24)] transition hover:-translate-y-0.5 hover:bg-[#A2E8FF] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
              href="/produits"
            >
              Voir les produits
              <ArrowRight className="size-3 sm:size-3.5" />
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#012D69]/35 bg-white px-3 font-body text-xs font-bold uppercase text-[#012D69] transition hover:-translate-y-0.5 hover:bg-[#F3F0FF] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
              href="/#faq"
            >
              <MessageCircle className="size-3 sm:size-3.5" />
              Contactez-nous
            </Link>
          </div>
        </div>

        <div className="grid h-fit w-full auto-rows-min grid-cols-2 gap-1 justify-self-center sm:max-w-[500px] sm:gap-2 lg:max-w-[600px] lg:gap-3 lg:justify-self-end">
          {heroCards.map((card) => (
            <Link
              aria-label={`Voir les produits ${card.alt}`}
              className="group relative block h-fit w-full overflow-visible transition duration-300 hover:-translate-y-1"
              href={card.href}
              key={card.src}
            >
              <Image
                alt={card.alt}
                className="block h-auto w-full drop-shadow-[0_16px_24px_rgba(1,45,105,0.28)] transition duration-300 group-hover:scale-[1.06]"
                height={card.height}
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 220px, 250px"
                src={card.src}
                width={card.width}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ImageCtaSlide({ slide }: { slide: ImageCtaHeroSlide }) {
  return (
    <>
      <Link
        aria-label={slide.alt}
        className="relative block h-full bg-black md:hidden"
        href={slide.href}
      >
        <Image
          alt={slide.alt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={slide.mobileImage}
        />
        <span className="absolute bottom-10 left-1/2 z-30 inline-flex min-h-11 -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full bg-white px-7 text-center font-body text-xs font-black uppercase tracking-[0.08em] text-black shadow-[0_14px_30px_rgba(0,0,0,0.28)]">
          {slide.ctaLabel}
        </span>
      </Link>

      <div className="relative hidden h-full bg-black md:block">
        <Image
          alt={slide.alt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={slide.image}
        />
        <div className="absolute bottom-0 left-[300px] z-30 flex pb-8 lg:pb-12">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-center font-body text-sm font-black uppercase tracking-[0.08em] text-black shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#F5F5F5] lg:min-h-14 lg:px-9 lg:text-base"
            href={slide.href}
          >
            {slide.ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}

function ImageLinkSlide({ slide }: { slide: ImageLinkHeroSlide }) {
  return (
    <>
      {slide.mobileImage ? (
        <Link
          aria-label={slide.alt}
          className="relative block h-full bg-[#00061E] md:hidden"
          href={slide.href}
        >
          <Image
            alt={slide.alt}
            className="object-cover transition duration-500 hover:scale-[1.01]"
            fill
            priority
            sizes="100vw"
            src={slide.mobileImage}
          />
        </Link>
      ) : (
        <Link
          aria-label={slide.alt}
          className="relative block h-full bg-[#00061E] md:hidden"
          href={slide.href}
        >
          <Image
            alt={slide.alt}
            className="object-cover transition duration-500 hover:scale-[1.01]"
            fill
            priority
            sizes="100vw"
            src={slide.image}
          />
        </Link>
      )}

      <div className="relative hidden h-full bg-[#00061E] md:block">
        <Image
          alt={slide.alt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={slide.image}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,6,30,0.76)_0%,rgba(0,6,30,0.45)_43%,rgba(0,6,30,0)_74%)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1350px] items-center px-6 py-8">
          <div className="max-w-[590px] text-left lg:pl-12 xl:pl-16">


            <p className=" max-w-[560px] font-body text-2xl font-bold leading-9 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.36)] lg:text-3xl lg:leading-[42px]">
              Découvrez l&apos;évolution la plus vaste et la plus immersive de
              la série Grand Theft Auto à ce jour
            </p>

            <p className="mt-5 font-heading text-2xl font-normal leading-tight text-[#FE50B3] drop-shadow-[0_4px_16px_rgba(0,0,0,0.36)] lg:text-xl">
              Disponible le 19 Septembre
            </p>
            <div className="inline-flex  mt-7 border-2 border-[#73016F] bg-[linear-gradient(90deg,#E88F48_0%,#FE4EB5_52%,#3A5FD8_100%)] px-10 py-3 font-heading text-3xl font-black leading-none tracking-[0.03em] text-white shadow-[0_18px_38px_rgba(0,0,0,0.3)] lg:text-xl">
              Grand Theft Auto VI
            </div>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[32px] border-2 border-black bg-white px-7 text-center font-body text-sm font-black uppercase tracking-[0.08em] text-black shadow-[0_14px_30px_rgba(0,0,0,0.26)] transition hover:-translate-y-0.5 hover:bg-[#F5F5F5] lg:min-h-14 lg:px-9 lg:text-base"
              href={slide.href}
            >
              PRÉCOMMANDER MAINTENANT
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function PsPlusSlide({ slide }: { slide: PsPlusHeroSlide }) {
  return (
    <>
      <Image
        alt=""
        className="-z-10 object-cover"
        fill
        sizes="100vw"
        src={slide.background}
      />

      <div className="mx-auto grid h-full max-h-full max-w-[1350px] items-center gap-5 overflow-hidden px-6 py-5 sm:gap-6 sm:py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-12 lg:py-8">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:pl-12 xl:pl-16">
          <h1 className="font-heading text-2xl font-black leading-tight tracking-[0.02em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] sm:text-4xl lg:text-3xl">
            Abonnement Carte <br />
            PlayStations Plus{" "}
            <span className="text-[#FFD600]">Global</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-7 text-white sm:mt-4 sm:text-2xl sm:leading-9">
            Permet d&apos;accéder à des fonctionnalités en ligne exclusives
            <br />
            Abonnement carte 12 mois
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FFD600] px-3 font-body text-xs font-bold uppercase text-black shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#FFE766] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
              href="/produits"
            >
              Voir tous les produits
              <ArrowRight className="size-3 sm:size-3.5" />
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white px-3 font-body text-xs font-bold uppercase text-black transition hover:-translate-y-0.5 hover:bg-slate-100 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
              href="/#faq"
            >
              <MessageCircle className="size-3 sm:size-3.5" />
              Contactez-nous
            </Link>
          </div>
        </div>

        <div
          className="grid h-fit w-fit max-w-full auto-rows-min justify-center gap-1 justify-self-center sm:gap-2 lg:gap-3 lg:justify-self-end"
          style={{ gridTemplateColumns: "repeat(2, max-content)" }}
        >
          {psPlusCards.map((card) => (
            <div
              className="group relative h-fit w-fit transition duration-300 hover:-translate-y-1"
              key={card.src}
            >
              <Image
                alt={card.alt}
                className="block h-[min(18svh,150px)] max-h-[150px] w-auto max-w-[calc((100vw-3.5rem)/2)] drop-shadow-[0_16px_28px_rgba(0,0,0,0.32)] transition duration-300 group-hover:scale-[1.05] sm:h-[min(18svh,180px)] sm:max-h-[180px] sm:max-w-[200px] lg:h-[min(28svh,230px)] lg:max-h-[230px] lg:max-w-[190px]"
                height={card.height}
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 220px, 260px"
                src={card.src}
                width={card.width}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
