import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import {
  FaApple,
  FaGooglePlay,
  FaPlaystation,
  FaSteam,
  FaXbox,
} from "react-icons/fa";
import { SiPubg, SiRoblox } from "react-icons/si";

const platforms = [
  { name: "Xbox", icon: FaXbox, tone: "text-[#107C10]" },
  { name: "PlayStation", icon: FaPlaystation, tone: "text-[#00439C]" },
  { name: "Steam", icon: FaSteam, tone: "text-[#1B2838]" },
  { name: "Nintendo", icon: Gamepad2, tone: "text-[#E60012]" },
  { name: "Google Play", icon: FaGooglePlay, tone: "text-[#34A853]" },
  { name: "iTunes", icon: FaApple, tone: "text-[#555555]" },
  { name: "PUBG Mobile", icon: SiPubg, tone: "text-[#C8A240]" },
  { name: "Roblox", icon: SiRoblox, tone: "text-[#CC0000]" },
] as const;

const bestSellers = [
  "PUBG Mobile 60 UC Recharge Global",
  "Free Fire 720 Diamonds Global",
  "Roblox 800 Robux Gift Card",
  "Call of Duty Mobile CP Recharge",
  "Valorant Points VP Europe",
] as const;

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <BannerBlock />
      <PlatformCardsBlock />
      <CategoryDescriptionBlock />
      <BestSellersBlock />
    </main>
  );
}

function BannerBlock() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-12">
      <div className="relative h-[180px] overflow-hidden bg-white shadow-[0_4px_4px_#B1A3F5] sm:h-[240px] lg:h-[300px]">
        <Image
          alt="Jeux mobile et top up gaming en Tunisie"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          src="/banner_products.png"
        />
      </div>
    </section>
  );
}

function PlatformCardsBlock() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {platforms.map((platform) => (
          <article
            className="group flex min-h-[138px] flex-col items-center justify-center gap-4 bg-white p-5 text-center shadow-[0_14px_34px_rgba(1,45,105,0.14)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(1,45,105,0.2)]"
            key={platform.name}
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-[#E7DAFF]">
              <platform.icon className={`size-9 ${platform.tone}`} />
            </span>
            <h2 className="font-body text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]">
              {platform.name}
            </h2>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryDescriptionBlock() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-12">
      <div className="bg-white/37 p-6 font-inter shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm md:p-8">
        <div className="flex items-center gap-3">

          <h1 className="font-heading text-xl font-bold leading-7 tracking-[0.04em] text-[#012D69] md:text-2xl">
            Jeux mobile & top up gaming en Tunisie
          </h1>
        </div>

        <div className="mt-6 grid gap-5 text-xs font-semibold leading-7 text-[#00061E]/75 md:text-sm">
          <p>
            Retrouvez les meilleures solutions de recharge jeux mobile et de top
            up gaming en Tunisie pour acheter rapidement vos crédits virtuels,
            UC, Diamonds, Robux, V-Bucks ou VP Valorant. Cette catégorie
            regroupe les principaux jeux mobile et services de recharge gaming
            mobile avec paiement en dinars tunisiens.
          </p>
          <p>
            Que vous cherchiez un top up PUBG Mobile, une recharge Free Fire,
            des Robux Roblox ou des crédits Call of Duty: Mobile, profitez d’une
            plateforme pensée pour les joueurs tunisiens avec livraison rapide,
            paiement local et recharge gaming simple sans carte bancaire
            internationale.
          </p>
        </div>
      </div>
    </section>
  );
}

function BestSellersBlock() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-2">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Best seller
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {bestSellers.map((name) => (
          <BestSellerCard key={name} name={name} />
        ))}
      </div>
    </section>
  );
}

function BestSellerCard({ name }: { name: string }) {
  return (
    <article className="relative mx-auto h-[435px] w-full max-w-[220px] overflow-hidden rounded-[15px] bg-white shadow-[0_18px_38px_rgba(1,45,105,0.14)] xl:max-w-[210px]">
      <div className="relative h-[342px]">
        <Image
          alt={name}
          className="object-cover"
          fill
          sizes="220px"
          src="/jeu1.jpg"
        />
        <div className="absolute bottom-0 left-0 right-0 flex h-10 items-center gap-3 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-3 text-white">
          <Gamepad2 className="size-7" />
          <span className="text-xs font-bold uppercase leading-3">
            Global
          </span>
        </div>
      </div>
      <div className="px-[18px] py-3">
        <h3 className="line-clamp-2 h-[35px] text-xs font-bold leading-[18px] text-[#00061E]">
          {name}
        </h3>
        <p className="mt-3 text-center text-xl font-bold leading-[22px] text-[#012D69]">
          50 Dt
        </p>
      </div>
    </article>
  );
}
