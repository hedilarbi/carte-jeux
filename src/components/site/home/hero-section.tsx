import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
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

export function HeroSection() {
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

  return (
    <div>
      <section
        className="relative isolate overflow-hidden"
        id="home"
      >
        <Image
          alt=""
          className="-z-10 object-cover"
          fill
          priority
          sizes="100vw"
          src="/banner-bg-2.png"
        />

        <div className="mx-auto flex min-h-[60svh] max-w-[1350px] flex-col items-center px-6 pb-5 pt-12 text-center sm:pb-6 sm:pt-14 lg:pt-16">
          <h1 className="max-w-4xl font-heading text-sm font-black leading-tight tracking-[0.03em] text-white drop-shadow-[0_4px_18px_rgba(1,45,105,0.32)] sm:text-lg lg:text-xl">
            EXAMENS : TERMINÉ <span className="text-[#4D3B94]">&gt;&gt;</span>{" "}
            MANETTE : EN MAIN
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#4D3B94] sm:text-base">
            Découvrez les jeux PlayStation à ne pas manquer cet été !
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-[#78DAFF] px-3 font-body text-[11px] font-bold uppercase text-[#012D69] shadow-[0_10px_24px_rgba(1,45,105,0.24)] transition hover:-translate-y-0.5 hover:bg-[#A2E8FF]"
              href="/produits"
            >
              Voir les produits
              <ArrowRight className="size-3" />
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#012D69]/35 bg-white px-3 font-body text-[11px] font-bold uppercase text-[#012D69] transition hover:-translate-y-0.5 hover:bg-[#F3F0FF]"
              href="/#faq"
            >
              <MessageCircle className="size-3" />
              Contactez-nous
            </Link>
          </div>

          <div className="mt-auto flex w-full max-w-[1040px] items-end justify-center gap-2 pt-5 sm:gap-4 sm:pt-6">
            {heroCards.map((card, index) => {
              const isFeatured = index === 1 || index === 2;

              return (
                <Link
                  aria-label={`Voir les produits ${card.alt}`}
                  className={`group block shrink-0 transition duration-300 hover:-translate-y-2 ${
                    isFeatured
                      ? "w-[23%] max-w-[160px]"
                      : "w-[20%] max-w-[138px]"
                  }`}
                  href={card.href}
                  key={card.src}
                >
                  <Image
                    alt={card.alt}
                    className="h-auto w-full drop-shadow-[0_16px_24px_rgba(1,45,105,0.28)] transition duration-300 group-hover:scale-[1.03]"
                    height={isFeatured ? 458 : 423}
                    sizes="(max-width: 640px) 23vw, (max-width: 1024px) 20vw, 236px"
                    src={card.src}
                    width={isFeatured ? 311 : 286}
                  />
                </Link>
              );
            })}
          </div>
        </div>
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
