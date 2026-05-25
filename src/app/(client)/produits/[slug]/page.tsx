import Image from "next/image";
import {
  Gamepad2,
  Heart,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { IoGameController } from "react-icons/io5";
import { FaGlobe } from "react-icons/fa";


type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const product = {
  title: "PUBG Mobile 60 UC",
  game: "PUBG Mobile",
  type: "Recharge gaming mobile / top up PUBG",
  usage: "Achat de skins, Royale Pass, evenements et contenus premium",
  platform: "PUBG Mobile",
  delivery: "Rapide apres validation",
  payment: "Methodes locales disponibles en Tunisie",
  compatibility: "Comptes PUBG Mobile",
  points: 20,
  price: "4,400",
  image: "/jeu1.jpg",
  gallery: ["/jeu1.jpg", "/banner_products.png", "/recomanded_section.png"],
};

const productFeatures = [
  ["Produit", product.title],
  ["Jeu", product.game],
  ["Type", product.type],
  ["Utilisation", product.usage],
  ["Plateforme", product.platform],
  ["Livraison", product.delivery],
  ["Paiement", product.payment],
  ["Compatible", product.compatibility],
] as const;

const descriptionParagraphs = [
  "Achetez votre recharge PUBG Mobile 60 UC et obtenez rapidement des UC PUBG pour debloquer des skins, caisses, evenements ou contenus premium directement dans le jeu. Ce pack PUBG Mobile 60 UC est ideal pour les joueurs recherchant un top up PUBG rapide et accessible sans grosse recharge.",
  "Cette recharge UC PUBG permet d'acheter des credits PUBG Mobile facilement en Tunisie avec des moyens de paiement locaux adaptes. Que vous cherchiez un PUBG Mobile top up rapide, une recharge PUBG UC instantanee ou un moyen d'acheter des UC PUBG sans carte bancaire internationale, cette offre repond aux besoins des joueurs mobile tunisiens.",
];

const relatedProducts = [
  "Grand Theft Auto V (PSN 5) Edition & Great White Shark Card",
  "PUBG Mobile 325 UC Recharge Global",
  "PlayStation Store Gift Card 10 EUR",
  "Xbox Game Pass Ultimate 1 Month",
  "Free Fire 720 Diamants Global",
];

const productFaqs = [
  "Comment fonctionne le top up PUBG Mobile 60 UC ?",
  "A quoi servent les 60 UC PUBG ?",
  "Peut-on acheter des UC PUBG en Tunisie sans carte bancaire internationale ?",
  "Combien de temps prend une recharge PUBG Mobile ?",
  "Quelle est la difference entre UC PUBG et top up PUBG Mobile ?",
  "Peut-on acheter d'autres montants de UC PUBG ?",
  "Les UC PUBG sont-ils compatibles avec tous les comptes ?",
  "Je cherche une recharge PUBG differente ou un produit gaming indisponible, que faire ?",
];

export default async function ProductPage({ params }: ProductPageProps) {
  await params;

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <ProductTopBlock />
      <ProductDetailsBlock />
      <RelatedProductsSection />
      <ProductFaqSection />
    </main>
  );
}

function ProductTopBlock() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)_360px] lg:items-start">
        <div className="relative min-h-[430px] overflow-hidden  bg-white shadow-[0_4px_4px_#B1A3F5]">
          <Image
            alt={product.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 300px"
            src={product.image}
          />
          <div className="absolute bottom-0 left-0 right-0 flex h-12 items-center gap-3 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-4 text-xs text-white">
            <Gamepad2 className="size-6" />
            <span className="font-bold uppercase tracking-[0.08em]">
              Global
            </span>
          </div>
        </div>

        <div className="min-w-0  ">
          <div className="flex items-start justify-between gap-4">
            <div>

              <h1 className="mt-2 font-heading text-xl font-black leading-tight text-[#012D69] md:text-2xl">
                {product.title}
              </h1>
            </div>
            <button
              aria-label="Ajouter aux favoris"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#012D69] shadow-[0_4px_12px_rgba(1,45,105,0.16)]"
              type="button"
            >
              <Heart className="size-5" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[#E5B000]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="size-4 fill-current" key={`star-${index}`} />
            ))}
          </div>

          <div className="my-5 flex flex-wrap justify-between items-center gap-3 px-10">
            <div className="flex items-center gap-1">
              <div className="bg-white rounded-full p-1">

                <FaGlobe className="size-6" />
              </div>
              <span className="text-sm font-semibold font-body text-[#012D69]">
                Global
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-white rounded-full p-1">

                <IoGameController className="size-6" />
              </div>
              <span className="text-sm font-semibold font-body text-[#012D69]">
                Mobile
              </span>
            </div>
          </div>

          <ul className="mt-4 grid gap-3 font-body decoration-dotted">
            {productFeatures.map(([label, value]) => (
              <li
                className="grid gap-1  text-[15px] sm:grid-cols-[100px_1fr] sm:gap-3"
                key={label}
              >
                <span className="font-bold text-[#012D69]">{label} :</span>
                <span className="font-semibold leading-4 text-[#00061E]/75">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <PurchaseCard />
      </div>
    </section>
  );
}

function ProductDetailsBlock() {
  return (
    <section className="mx-auto grid max-w-[1200px] gap-8 px-6 pb-12 lg:grid-cols-[2fr_1fr] lg:items-center">
      <div className="bg-white/37 p-4 font-inter shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm md:p-4">

        <div className=" grid gap-5">
          {descriptionParagraphs.map((paragraph) => (
            <p
              className="text-[11px] font-semibold leading-6 text-[#00061E]/75 md:text-xs"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="mb-4 font-body font-bold text-[#012D69]">Galerie:</h3>
        <div className="grid grid-cols-3 gap-3">
          {product.gallery.slice(0, 3).map((image, index) => (
            <div
              className="relative h-[136px] overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(1,45,105,0.14)] lg:h-[118px]"
              key={`${image}-${index}`}
            >
              <Image
                alt={`${product.title} aperçu ${index + 1}`}
                className="object-cover"
                fill
                sizes="180px"
                src={image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PurchaseCard() {
  return (
    <aside className="rounded-[21px] bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] ">
      <p className="text-xl font-semibold leading-5 tracking-[0.06em]">
        Gagnez des points plus: {product.points}
      </p>

      <div className="mt-10 flex items-center justify-between gap-4">
        <span className="text-xl font-bold tracking-[0.06em]">
          Quantité:
        </span>
        <div className="flex h-11 w-[176px] items-center justify-between bg-[#D9D9D9]/60 px-7 text-base font-bold">
          <Minus className="size-5 opacity-35" />
          <span>1</span>
          <Plus className="size-5 opacity-35" />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xl font-bold tracking-[0.06em]">Prix:</p>
        <div className="mt-3 flex h-14 w-full items-center justify-center bg-[#D9D9D9]/55 text-center text-xl font-bold tracking-[0.06em] blur-[0.2px]">
          {product.price}
        </div>
      </div>

      <button
        className="mt-10 flex py-4 w-full items-center justify-center rounded-[14px] bg-[#B0A4F5] px-4 text-center text-lg font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)]"
        type="button"
      >
        Achetez maintenant
      </button>
    </aside>
  );
}

function RelatedProductsSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Les joueurs ont également consulté
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {relatedProducts.map((name) => (
          <RelatedProductCard key={name} name={name} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <button
          className="h-12 w-full max-w-[240px] rounded-xl bg-[#B0A4F5] font-heading text-xs font-bold uppercase tracking-[0.06em] text-black shadow-[0_4px_8.4px_-1px_rgba(1,45,105,0.63)]"
          type="button"
        >
          Charger plus
        </button>
      </div>
    </section>
  );
}

function RelatedProductCard({ name }: { name: string }) {
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

function ProductFaqSection() {
  return (
    <section className="min-h-[830px] bg-[#012D69] px-6 py-16 text-white lg:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mx-auto max-w-[900px] text-center font-heading text-xl font-bold leading-8 tracking-[0.06em]">
          Vos questions nos réponses
          <br />
          {product.title}
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-9">
          {productFaqs.map((question) => (
            <article
              className="flex min-h-[60px] items-center gap-5 rounded-[52.5px] bg-[#CECECE]/18 p-2 pr-8"
              key={question}
            >
              <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-white">
                <span className="flex size-[35px] items-center justify-center rounded-full ">
                  <Image
                    alt=""
                    height={49}
                    src="/icon_qa.svg"
                    width={71}
                  />
                </span>
              </span>
              <p className="text-xs leading-[150.25%] text-white md:text-sm">
                {question}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
