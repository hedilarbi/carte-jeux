"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    href: "/produits/minecraft-java-edition-pc",
    src: "/minecraft-card.png",
  },
  {
    alt: "EA Sports FC 26",
    href: "/produits/fc-26-ps4-ps5",
    src: "/fc26-card.png",
  },
  {
    alt: "Grand Theft Auto V",
    href: "/produits/gta-v-ps4-ps5-bundle",
    src: "/gtav-card.png",
  },
  {
    alt: "Red Dead Redemption",
    href: "/produits/red-dead-redemption-2-pc",
    src: "/rdd-card.png",
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
};

type PsPlusHeroSlide = {
  background: string;
  id: string;
  kind: "ps-plus";
};

type HeroSlide = ProductGridHeroSlide | ImageLinkHeroSlide | PsPlusHeroSlide;

const psPlusCards = [
  {
    alt: "PlayStation Plus Global",
    src: "/psnhero1.png",
  },
  {
    alt: "PlayStation Plus 12 mois",
    src: "/psnhero2.png",
  },
  {
    alt: "Carte PlayStation Plus",
    src: "/psnhero3.png",
  },
  {
    alt: "Abonnement PlayStation Plus",
    src: "/psnhero4.png",
  },
];

const slideIntervalMs = 3500;

const heroSlides: HeroSlide[] = [
  {
    background: "/banner-bg-2.png",
    id: "examens-ete",
    kind: "product-grid",
  },
  {
    alt: "Précommande GTA VI",
    href: "/precommande-gta-vi",
    id: "precommande-gta-vi",
    image: "/banner_products.jpg",
    kind: "image-link",
  },
  {
    background: "/hero.jpg",
    id: "ps-plus-global",
    kind: "ps-plus",
  },
];

export function HeroSection() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
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
    if (!hasMultipleSlides) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveSlideIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, slideIntervalMs);

    return () => window.clearTimeout(timeout);
  }, [activeSlideIndex, hasMultipleSlides]);

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

  return (
    <div>
      <section
        className="relative isolate mt-3 overflow-hidden"
        id="home"
      >
        <div
          className="flex h-[70svh] max-h-[70svh] transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div
              className="relative isolate h-full min-w-full overflow-hidden"
              key={slide.id}
            >
              {slide.kind === "product-grid" ? (
                <ProductGridSlide slide={slide} />
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
                  className={`h-2.5 rounded-full transition ${
                    index === activeSlideIndex
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
        <div className="max-w-xl pl-4 text-left sm:pl-8 lg:pl-12 xl:pl-16">
          <h1 className="font-heading text-2xl font-black leading-tight tracking-[0.03em] text-[#78DAFF] drop-shadow-[0_4px_18px_rgba(1,45,105,0.32)] sm:text-3xl lg:text-4xl">
            EXAMENS : TERMINÉ{" "}
            <span>&gt;&gt;</span> MANETTE : EN MAIN
          </h1>
          <p className="mt-4 max-w-lg text-lg font-semibold leading-8 text-white sm:text-xl">
            Découvrez les jeux PlayStation à ne pas manquer cet été !
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#78DAFF] px-4 font-body text-xs font-bold uppercase text-[#012D69] shadow-[0_10px_24px_rgba(1,45,105,0.24)] transition hover:-translate-y-0.5 hover:bg-[#A2E8FF]"
              href="/produits"
            >
              Voir les produits
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#012D69]/35 bg-white px-4 font-body text-xs font-bold uppercase text-[#012D69] transition hover:-translate-y-0.5 hover:bg-[#F3F0FF]"
              href="/#faq"
            >
              <MessageCircle className="size-3.5" />
              Contactez-nous
            </Link>
          </div>
        </div>

        <div className="grid h-[32svh] max-h-[250px] min-h-0 w-full max-w-[360px] grid-cols-2 grid-rows-2 gap-2 justify-self-center sm:h-[36svh] sm:max-h-[320px] sm:max-w-[420px] sm:gap-3 lg:h-[calc(70svh-4rem)] lg:max-h-[520px] lg:max-w-[520px] lg:gap-4 lg:justify-self-end">
          {heroCards.map((card) => (
            <Link
              aria-label={`Voir les produits ${card.alt}`}
              className="group relative block h-full min-h-0 overflow-visible transition duration-300 hover:-translate-y-1"
              href={card.href}
              key={card.src}
            >
              <Image
                alt={card.alt}
                className="object-contain drop-shadow-[0_16px_24px_rgba(1,45,105,0.28)] transition duration-300 group-hover:scale-[1.06]"
                fill
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 220px, 250px"
                src={card.src}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ImageLinkSlide({ slide }: { slide: ImageLinkHeroSlide }) {
  return (
    <Link
      aria-label={slide.alt}
      className="relative block h-full bg-[#00061E]"
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
        <div className="max-w-xl pl-4 text-left sm:pl-8 lg:pl-12 xl:pl-16">
          <h1 className="font-heading text-2xl font-black leading-tight tracking-[0.02em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] sm:text-3xl lg:text-4xl">
            Abonnement Carte <br />
            PlayStations Plus{" "}
            <span className="text-[#FFD600]">Global</span>
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-white sm:text-lg">
            Permet d&apos;accéder à des fonctionnalités en ligne exclusives
            <br />
            Abonnement carte 12 mois
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FFD600] px-4 font-body text-xs font-bold uppercase text-black shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#FFE766]"
              href="/produits"
            >
              Voir tous les produits
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 font-body text-xs font-bold uppercase text-black transition hover:-translate-y-0.5 hover:bg-slate-100"
              href="/#faq"
            >
              <MessageCircle className="size-3.5" />
              Contactez-nous
            </Link>
          </div>
        </div>

        <div className="grid h-[34svh] max-h-[270px] min-h-0 w-full max-w-[380px] grid-cols-2 grid-rows-2 gap-2 justify-self-center sm:h-[38svh] sm:max-h-[340px] sm:max-w-[450px] sm:gap-3 lg:h-[calc(70svh-4rem)] lg:max-h-[520px] lg:max-w-[540px] lg:gap-4 lg:justify-self-end">
          {psPlusCards.map((card) => (
            <div
              className="group relative h-full min-h-0 transition duration-300 hover:-translate-y-1"
              key={card.src}
            >
              <Image
                alt={card.alt}
                className="object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.32)] transition duration-300 group-hover:scale-[1.05]"
                fill
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 220px, 260px"
                src={card.src}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
