import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { CategoryCardsGrid } from "@/components/site/categories/category-cards-grid";
import { ProductPlatformBadge } from "@/components/site/product-platform-badge";
import {
  categoriesService,
  type CategoriesPageCategory,
  type CategoriesPageProduct,
} from "@/services/categories.service";

export default async function CategoriesPage() {
  await connection();

  const content = await categoriesService.getCategoriesPageContent();

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <BannerBlock />
      <CategoryCardsBlock
        categories={content.platforms}
        eyebrow="// Plateformes"
        title="Plateformes gaming"
      />
      <CategoryCardsBlock
        categories={content.types}
        eyebrow="// Types"
        title="Types de produits"
      />
      <CategoryDescriptionBlock
        platformCount={content.platforms.length}
        typeCount={content.types.length}
      />
      <BestSellersBlock products={content.products} />
    </main>
  );
}

function BannerBlock() {
  return (
    <section className="mx-auto max-w-[1350px] px-6 py-10 md:py-12">
      <div className="flex max-h-[240px] w-full max-w-full items-center justify-center overflow-hidden bg-white shadow-[0_4px_4px_#B1A3F5] sm:max-h-[320px] lg:max-h-[420px]">
        <Image
          alt="Jeux mobile et top up gaming en Tunisie"
          className="h-auto max-h-[240px] w-auto max-w-full object-contain sm:max-h-[320px] lg:max-h-[420px]"
          height={1723}
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          src="/banner_products.jpg"
          width={3714}
        />
      </div>
    </section>
  );
}

function CategoryCardsBlock({
  categories,
  eyebrow,
  title,
}: {
  categories: CategoriesPageCategory[];
  eyebrow: string;
  title: string;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1350px] px-6 pb-12">
      <div className="mb-6">
        <span className="font-mono text-[11px] font-bold uppercase text-[#012D69]/70">
          {eyebrow}
        </span>
        <h1 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-[0.04em] text-[#012D69]">
          {title}
        </h1>
      </div>

      <CategoryCardsGrid categories={categories} />
    </section>
  );
}

function CategoryDescriptionBlock({
  platformCount,
  typeCount,
}: {
  platformCount: number;
  typeCount: number;
}) {
  return (
    <section className="mx-auto max-w-[1350px] px-6 pb-12">
      <div className="bg-white/37 p-6 font-inter shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm md:p-8">
        <h2 className="font-heading text-xl font-bold leading-7 tracking-[0.04em] text-[#012D69] md:text-2xl">
          Catégories gaming en Tunisie
        </h2>

        <div className="mt-6 grid gap-5 text-xs font-semibold leading-7 text-[#00061E]/75 md:text-sm">
          <p>
            Retrouvez toutes les plateformes et types de produits disponibles :
            cartes de recharge, jeux, abonnements et top up mobile. Les
            catégories sont organisées depuis l’admin et affichées selon leur
            ordre personnalisé.
          </p>
          <p>
            Catalogue actuel : {platformCount} plateformes et {typeCount} types
            de produits. Sélectionnez une catégorie pour accéder directement aux
            produits filtrés.
          </p>
        </div>
      </div>
    </section>
  );
}

function BestSellersBlock({
  products,
}: {
  products: CategoriesPageProduct[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1350px] px-6 pb-24 pt-2">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Best seller
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <BestSellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function BestSellerCard({ product }: { product: CategoriesPageProduct }) {
  return (
    <Link
      className="group relative mx-auto h-[435px] w-full max-w-[220px] overflow-hidden rounded-[15px] bg-white shadow-[0_18px_38px_rgba(1,45,105,0.14)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(1,45,105,0.18)] xl:max-w-[210px]"
      href={`/produits/${product.slug}`}
    >
      <div className="relative h-[342px]">
        <Image
          alt={product.title}
          className="object-cover"
          fill
          sizes="220px"
          src={product.image ?? "/jeu1.jpg"}
        />
        <ProductPlatformBadge
          className="absolute bottom-0 left-0 right-0 h-10 px-3 text-xs"
          image={product.platformImage}
          name={product.platformName}
        />
      </div>
      <div className="px-[18px] py-3">
        <h3 className="line-clamp-2 h-[35px] font-body text-xs font-bold leading-[18px] text-[#00061E]">
          {product.title}
        </h3>
        <p className="mt-3 text-center font-body text-xl font-bold leading-[22px] text-red-600">
          {product.price} TND
        </p>
      </div>
    </Link>
  );
}
