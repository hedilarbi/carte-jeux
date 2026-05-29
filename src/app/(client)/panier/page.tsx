import Image from "next/image";
import {
  BadgePercent,
  Gamepad2,
  Heart,
  Info,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

const cartItems = [
  {
    id: 1,
    name: "PUBG Mobile 60 UC",
    image: "/jeu1.jpg",
    tags: ["Global", "Mobile"],
    quantity: 1,
    price: "4,400",
    originalPrice: "4,900",
  },
  {
    id: 2,
    name: "GTA V Rockstar Games Launcher",
    image: "/jeu1.jpg",
    tags: ["Global", "PC"],
    quantity: 2,
    price: "35,000",
    originalPrice: "50,900",
  },
  {
    id: 3,
    name: "Carte Steam 20 EUR",
    image: "/jeu1.jpg",
    tags: ["Global", "Code"],
    quantity: 1,
    price: "40,000",
  },
];

const inspiredProducts = [
  "Grand Theft Auto V (PSN 5) Edition & Great White Shark Card",
  "PUBG Mobile 325 UC Recharge Global",
  "PlayStation Store Gift Card 10 EUR",
  "Xbox Game Pass Ultimate 1 Month",
  "Free Fire 720 Diamants Global",
];

const steps = ["Panier", "Paiement", "Obtenir votre produit"] as const;

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <CartProgress />

      <section className="mx-auto grid max-w-[1200px] gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid gap-5">
          {cartItems.map((item) => (
            <CartItemCard item={item} key={item.id} />
          ))}
        </div>

        <CartSummary />
      </section>

      <InspiredSection />
    </main>
  );
}

function CartProgress() {
  return (
    <section className="bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)] mt-6">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
        {steps.map((step, index) => (
          <div
            className="flex min-w-0 flex-1 items-center gap-3"
            key={step}
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  index === 0
                    ? "flex size-12 items-center justify-center rounded-full bg-[#81D1FF] font-heading text-lg font-bold text-[#012D69]"
                    : "flex size-10 items-center justify-center rounded-full bg-[#AFAFAF] font-heading text-sm font-bold text-[#012D69]"
                }
              >
                {index + 1}
              </span>
              <span
                className={
                  index === 0
                    ? "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#81D1FF] sm:block"
                    : "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#E6E6E6] sm:block"
                }
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="h-[3px] min-w-8 flex-1 bg-[linear-gradient(90deg,#D9D9D9_0%,#9B9B9B_100%)]" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function CartItemCard({ item }: { item: (typeof cartItems)[number] }) {
  return (
    <article className="relative grid gap-5 bg-white/37 p-4 shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm md:grid-cols-[170px_minmax(0,1fr)_190px] md:p-5">
      <div className="relative h-[190px] overflow-hidden bg-white md:h-[225px]">
        <Image
          alt={item.name}
          className="object-cover"
          fill
          sizes="170px"
          src={item.image}
        />
      </div>

      <div className="min-w-0 pr-16 md:pr-0">
        <h2 className="font-body text-sm font-bold leading-6 text-[#012D69]">
          Produit : {item.name}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {item.tags.map((tag) => (
            <span
              className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 font-body text-xs font-semibold text-[#012D69]"
              key={tag}
            >
              <Gamepad2 className="size-4" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1 text-[#E5B000]">
          {Array.from({ length: 5 }).map((_, index) => (
            <span className="text-base leading-none" key={index}>
              ★
            </span>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 font-body text-xs font-medium tracking-[0.1em] text-black">

          <span className="inline-flex size-5 items-center justify-center rounded-full border border-black text-[11px]">
            <Info className="size-3" />
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-5 md:items-end">
        <div className="absolute right-4 top-4 flex items-center gap-3">
          <button
            aria-label="Ajouter aux favoris"
            className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_10px_rgba(1,45,105,0.12)]"
            type="button"
          >
            <Heart className="size-4" />
          </button>
          <button
            aria-label="Supprimer le produit"
            className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_10px_rgba(1,45,105,0.12)]"
            type="button"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-12 flex h-11 w-[180px] items-center justify-between bg-[#A1A1A1]/30 px-7 font-inter text-base font-bold text-black md:mt-20">
          <Minus className="size-5 opacity-35" />
          <span className="opacity-70">{item.quantity}</span>
          <Plus className="size-5 opacity-35" />
        </div>

        <div className="text-right font-inter">
          <div className="flex items-center justify-end gap-3">
            {item.originalPrice ? (
              <span className="text-lg text-[#2D2D2D] line-through opacity-80">
                {item.originalPrice}
              </span>
            ) : null}
            <span className="text-2xl font-bold tracking-[0.06em] text-[#191919]">
              {item.price}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartSummary() {
  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[725px]">
      <p className="font-inter text-sm font-semibold leading-5 tracking-[0.06em] text-[#012D69]">
        Gagnez des points plus: 150
      </p>

      <h2 className="mt-10 font-inter text-xl font-bold tracking-[0.06em]">
        Récapitulatif
      </h2>

      <button
        className="mt-8 flex h-14 w-full items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)]"
        type="button"
      >
        Passer au paiement
      </button>

      <div className="mt-9 font-inter">
        <p className="text-lg font-bold tracking-[0.06em]">
          Total ( 4 produits )
        </p>
        <div className="mt-3 flex h-[68px] w-full items-center justify-center bg-[#D9D9D9]/55 text-center text-2xl font-bold tracking-[0.06em] blur-[0.2px]">
          79,400
        </div>
      </div>

      <div className="mt-7 border-y-2 border-[#DADDFF] py-5">
        <label className="flex items-start gap-3 font-inter text-xs font-medium leading-5 text-black/76">
          <input
            className="mt-1 size-[26px] shrink-0 accent-[#B0A4F5]"
            defaultChecked
            type="checkbox"
          />
          <span>
            J&apos;accepte de recevoir une invitation par e-mail pour évaluer le
            service sur Trustpilot.
          </span>
        </label>

        <label className="mt-5 flex items-start gap-3 font-inter text-xs font-medium leading-5 text-black/76">
          <input
            className="mt-1 size-[26px] shrink-0 accent-[#B0A4F5]"
            defaultChecked
            type="checkbox"
          />
          <span>
            Je souhaite recevoir des offres personnalisées pour les meilleures
            offres de jeux.
          </span>
        </label>
      </div>

      <div className="mt-6">
        <label className="font-inter text-sm font-medium tracking-[0.01em] text-black">
          <span className="flex items-center gap-2">
            <BadgePercent className="size-4 text-[#968AE0]" />
            Vous avez un code promo ?
          </span>
          <input
            className="mt-4 h-[57px] w-full bg-[#B0A4F5]/47 px-4 text-center font-inter text-lg font-semibold tracking-[0.01em] text-black outline-none placeholder:text-black/45"
            defaultValue="GAMER15"
          />
        </label>
      </div>
    </aside>
  );
}

function InspiredSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Inspiré par vos choix
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {inspiredProducts.map((name) => (
          <InspiredCard key={name} name={name} />
        ))}
      </div>
    </section>
  );
}

function InspiredCard({ name }: { name: string }) {
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
