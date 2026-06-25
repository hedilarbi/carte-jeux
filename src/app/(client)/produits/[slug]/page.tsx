import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Info,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";

import { ProductPlatformBadge } from "@/components/site/product-platform-badge";
import { FavoriteButton } from "@/components/site/favorites/favorite-button";
import { FaqSection, type FaqItem } from "@/components/site/home/faq-section";
import {
  productDetailService,
  type ProductDetailPageContent,
  type ProductDetailRelatedProduct,
} from "@/services/product-detail.service";
import { AddToCartButton } from "@/components/site/add-to-cart-button";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productDetailService.getBySlug(slug);

  if (!product) {
    return {
      title: "Produit introuvable",
    };
  }

  const title = product.seoTitle || `${product.title} | PlaySDepot`;
  const description =
    product.seoDescription ||
    product.description ||
    product.shortDescription ||
    `Achetez ${product.title} en Tunisie.`;

  return {
    description,
    openGraph: {
      description,
      images: product.image ? [product.image] : undefined,
      title,
      type: "website",
    },
    title,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productDetailService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <ProductTopBlock product={product} />
      <ProductDetailsBlock product={product} />
      <RelatedProductsSection products={product.relatedProducts} />
      <ProductFaqSection product={product} />
    </main>
  );
}

function ProductTopBlock({ product }: { product: ProductDetailPageContent }) {
  const typeLabel =
    product.categories.map((category) => category.label).join(", ") ||
    "Produit numérique";
  const regionLabel =
    product.regions.map((region) => region.label).join(", ") || "Global";

  const productFeatures = [
    ["Produit", product.title],
    ["Type", typeLabel],
    ["Plateforme", product.platform.label],
    ["Région", regionLabel],
    ["Valeur", `${product.faceValue} ${product.currency}`],
    ["Livraison", "Après validation de la commande"],
    ["SKU", product.sku],
  ] as const;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)_360px] lg:items-start">
        <div className="relative aspect-[625/873] overflow-hidden bg-white shadow-[0_4px_4px_#B1A3F5]">
          <Image
            alt={product.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 320px"
            src={product.image ?? "/jeu1.jpg"}
          />
          <ProductPlatformBadge
            className="absolute bottom-0 left-0 right-0 h-12 px-4 text-sm"
            image={product.platform.image}
            name={product.platform.label}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>

              <h1 className="mt-2 font-heading text-xl font-black leading-tight text-[#012D69] md:text-2xl">
                {product.title}
              </h1>
            </div>
            <FavoriteButton
              aria-label="Ajouter aux favoris"
              activeClassName="text-danger"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#012D69] shadow-[0_4px_12px_rgba(1,45,105,0.16)] transition hover:text-danger"
              iconClassName="size-5"
              productId={product.id}
              productSlug={product.slug}
            />
          </div>

          <div className="mt-2 flex items-center gap-1 text-[#E5B000]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="size-4 fill-current" key={`star-${index}`} />
            ))}
          </div>

          <div className="my-5 flex flex-wrap items-center gap-3">
            <InfoPill label={regionLabel} />
            <InfoPill label={typeLabel} />
          </div>

          <ul className="mt-4 grid gap-3 font-body">
            {productFeatures.map(([label, value]) => (
              <li
                className="grid gap-1 text-[15px] sm:grid-cols-[110px_1fr] sm:gap-3"
                key={label}
              >
                <span className="font-bold text-[#012D69]">{label} :</span>
                <span className="font-semibold leading-5 text-[#00061E]/75">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <PurchaseCard product={product} />
      </div>
    </section>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 font-body text-sm font-semibold text-[#012D69] shadow-[0_4px_12px_rgba(1,45,105,0.08)]">
      <CheckCircle2 className="size-4" />
      {label}
    </span>
  );
}

function ProductDetailsBlock({
  product,
}: {
  product: ProductDetailPageContent;
}) {
  const description =
    product.description ??
    product.shortDescription ??
    `${product.title} est disponible en Tunisie avec livraison numérique après validation de la commande. Vérifiez la plateforme et la région avant l'achat.`;
  const descriptionParagraphs = description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const gallery = product.gallery.length > 0 ? product.gallery : ["/jeu1.jpg"];

  return (
    <section className="mx-auto grid max-w-[1200px] gap-8 px-6 pb-12 lg:grid-cols-[2fr_1fr] lg:items-start">
      <div className="bg-white/45 p-5 font-inter shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
        <h2 className="font-heading text-lg font-bold text-[#012D69]">
          Description
        </h2>
        <div className="mt-4 grid gap-4">
          {descriptionParagraphs.map((paragraph) => (
            <p
              className="text-sm font-semibold leading-7 text-[#00061E]/75"
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
          {gallery.slice(0, 3).map((image, index) => (
            <div
              className="relative aspect-[625/873] overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(1,45,105,0.14)]"
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

function PurchaseCard({ product }: { product: ProductDetailPageContent }) {
  return (
    <aside className="rounded-[21px] bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px]">
      <p className="text-xl font-semibold leading-5 tracking-[0.06em]">
        Gagnez des points plus: {product.points}
      </p>

      <div className="mt-10 flex items-center justify-between gap-4">
        <span className="text-xl font-bold tracking-[0.06em]">Quantité:</span>
        <div className="flex h-11 w-[176px] items-center justify-between bg-[#D9D9D9]/60 px-7 text-base font-bold">
          <Minus className="size-5 opacity-35" />
          <span>1</span>
          <Plus className="size-5 opacity-35" />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xl font-bold tracking-[0.06em]">Prix:</p>
        <div className="mt-3 flex min-h-14 w-full flex-col items-center justify-center bg-[#D9D9D9]/55 px-4 text-center font-bold tracking-[0.06em]">
          {product.originalPrice ? (
            <span className="text-sm text-[#2D2D2D]/70 line-through">
              {product.originalPrice} {product.currency}
            </span>
          ) : null}
          <span className="text-xl">
            {product.price} {product.currency}
          </span>
        </div>
      </div>

      <AddToCartButton
        className="mt-10 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-4 py-4 text-center text-lg font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
        productId={product.id}
        productSlug={product.slug}
        redirectTo="/panier"
      >
        <ShoppingCart className="size-5" />
        Acheter maintenant
      </AddToCartButton>

      <p className="mt-5 flex items-start gap-2 text-xs font-semibold leading-5 text-[#012D69]/75">
        <Info className="mt-0.5 size-4 shrink-0" />
        Produit numérique livré après confirmation de paiement.
      </p>
    </aside>
  );
}

function RelatedProductsSection({
  products,
}: {
  products: ProductDetailRelatedProduct[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Les joueurs ont également consulté
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function RelatedProductCard({
  product,
}: {
  product: ProductDetailRelatedProduct;
}) {
  return (
    <article
      className="group relative mx-auto flex w-full max-w-[220px] flex-col overflow-hidden rounded-[15px] bg-white font-body shadow-[0_18px_38px_rgba(1,45,105,0.14)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(1,45,105,0.18)] xl:max-w-[210px]"
    >
      <Link
        aria-label={`Voir le produit - ${product.title}`}
        className="absolute inset-0 z-10"
        href={`/produits/${product.slug}`}
      />
      <div className="relative aspect-[625/873]">
        <Image
          alt={product.title}
          className="object-cover"
          fill
          sizes="220px"
          src={product.image ?? "/jeu1.jpg"}
        />
        <ProductPlatformBadge
          action={
            <FavoriteButton
              aria-label={`Ajouter aux favoris - ${product.title}`}
              activeClassName="bg-white text-danger"
              className="flex size-7 items-center justify-center rounded-full bg-white/14 text-white transition hover:bg-white/24 hover:text-[#B0A4F5]"
              iconClassName="size-4"
              productId={product.id}
              productSlug={product.slug}
            />
          }
          className="absolute bottom-0 left-0 right-0 z-20 h-10 px-3 text-xs"
          image={product.platformImage}
          name={product.platformName}
        />
      </div>
      <div className="px-[18px] py-3">
        <h3 className="line-clamp-2 h-[35px] font-body text-xs font-bold leading-[18px] text-[#00061E]">
          {product.title}
        </h3>
        <p className="mt-3 text-center font-body text-xl font-bold leading-[22px] text-[#012D69]">
          {product.price} TND
        </p>
      </div>
    </article>
  );
}

function getProductFaqs(product: ProductDetailPageContent): FaqItem[] {
  if (product.faqItems.length > 0) {
    return product.faqItems;
  }

  return [
    {
      question: "Comment recevoir ce produit numérique ?",
      answer:
        "Après validation de votre commande, notre équipe prépare la livraison numérique et vous envoie les informations nécessaires par e-mail.",
    },
    {
      question: "Ce produit est-il compatible avec mon compte ?",
      answer: `Vérifiez la plateforme ${product.platform.label} et la région indiquée sur la fiche avant l'achat. Le code doit être utilisé sur un compte compatible.`,
    },
    {
      question: "Puis-je payer en Tunisie avec une méthode locale ?",
      answer:
        "Oui. PlaySDepot permet de commander en Tunisie avec les moyens de paiement disponibles localement sur la page de checkout.",
    },
    {
      question: "Que faire si j'ai une question avant l'achat ?",
      answer:
        "Utilisez le formulaire de contact dans cette section. Votre demande sera enregistrée et notre équipe vous répondra par e-mail.",
    },
  ];
}

function ProductFaqSection({
  product,
}: {
  product: ProductDetailPageContent;
}) {
  return (
    <FaqSection
      contactDescription="Envoyez-nous votre question sur ce produit. Nous vous répondrons par e-mail avec les informations de compatibilité, région ou disponibilité."
      contactEyebrow="// Contact produit"
      contactTitle={`Une question sur ${product.title} ?`}
      defaultPlatform={product.platform.label}
      defaultProductName={product.title}
      faqDescription="Les réponses utiles avant de finaliser votre achat."
      faqEyebrow="// FAQ produit"
      faqs={getProductFaqs(product)}
      faqTitle={`Questions fréquentes - ${product.title}`}
      id="product-faq"
    />
  );
}
