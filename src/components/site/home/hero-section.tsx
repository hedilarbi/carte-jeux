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

type HeroSlide = ProductGridHeroSlide | ImageLinkHeroSlide;

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
];

export function HeroSection() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const hasMultipleSlides = heroSlides.length > 1;
  const activeSlide = heroSlides[activeSlideIndex] ?? heroSlides[0];
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

    const interval = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, [hasMultipleSlides]);

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
        className="relative isolate overflow-hidden"
        id="home"
      >
        {activeSlide.kind === "product-grid" ? (
          <ProductGridSlide slide={activeSlide} />
        ) : (
          <ImageLinkSlide slide={activeSlide} />
        )}

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

      <div className="mx-auto grid h-[70svh] max-h-[70svh] max-w-[1350px] items-center gap-5 overflow-hidden px-6 py-5 sm:gap-6 sm:py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-12 lg:py-8">
        <div className="max-w-xl pl-4 text-left sm:pl-8 lg:pl-12 xl:pl-16">
          <h1 className="font-heading text-2xl font-black leading-tight tracking-[0.03em] text-white drop-shadow-[0_4px_18px_rgba(1,45,105,0.32)] sm:text-3xl lg:text-4xl">
            EXAMENS : TERMINÉ{" "}
            <span className="text-[#4D3B94]">&gt;&gt;</span> MANETTE : EN MAIN
          </h1>
          <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-[#4D3B94] sm:text-lg">
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
      className="relative block h-[70svh] max-h-[70svh] bg-[#00061E]"
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
