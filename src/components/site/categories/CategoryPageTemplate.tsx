import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CategorySeoContent from "@/components/site/categories/category-seo-content";
import CatalogClient from "@/components/site/products/CatalogClient";
import { catalogService } from "@/services/catalog.service";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  buildCategoryHref,
  buildPaginatedHref,
  normalizeCanonicalUrl,
  toAbsoluteUrl,
} from "@/lib/utils/catalog-links";
import {
  hasListingFilters,
  type ListingSearchParams,
  readListingPage,
  withPageDescription,
  withPageSuffix,
} from "@/lib/utils/catalog-seo";
import {
  CategoryModel,
  type CategoryFaqItem,
  type CategorySeoSection,
} from "@/models/category.model";

export async function generateCategoryMetadata(
  slug: string,
  isPlateforme: boolean,
  params: ListingSearchParams,
): Promise<Metadata> {
  await connectToDatabase();
  const category = await CategoryModel.findOne({ slug, isPlateforme }).lean();

  if (!category || !category.isActive) {
    return {};
  }

  const page = readListingPage(params) ?? 1;
  const path = buildCategoryHref(slug, isPlateforme);
  // `absolute`: the stored titles already carry the brand, the root layout
  // template would append it a second time.
  const title = {
    absolute: withPageSuffix(
      category.seoTitle || `${category.name} - PlayDepot`,
      page,
    ),
  };
  const description = withPageDescription(
    category.metaDescription ||
      category.description ||
      `Découvrez les produits ${category.name} disponibles en Tunisie sur PlayDepot.`,
    page,
  );
  // Paginated pages are self-canonical: canonicalising them to page 1 would make
  // Google drop them and lose the path to the products they list.
  const canonical =
    page === 1 && category.canonical
      ? normalizeCanonicalUrl(category.canonical)
      : toAbsoluteUrl(buildPaginatedHref(path, page));

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !!category.indexable && !hasListingFilters(params),
      follow: true,
    },
  };
}

export default async function CategoryPageTemplate({
  slug,
  isPlateforme,
  searchParams,
}: {
  slug: string;
  isPlateforme: boolean;
  searchParams: ListingSearchParams;
}) {
  const page = readListingPage(searchParams);

  if (page === null) {
    notFound();
  }

  await connectToDatabase();
  const category = await CategoryModel.findOne({ slug, isPlateforme }).lean();

  if (!category || !category.isActive) {
    notFound();
  }

  const content = await catalogService.getProductsPageContent({
    page: String(page),
    [isPlateforme ? "platform" : "type"]: slug,
  });

  if (page > content.pagination.totalPages) {
    notFound();
  }

  const path = buildCategoryHref(slug, isPlateforme);
  const categoryName = category.h1 || category.name;
  // Sections and FAQ sit on page 1 only, so paginated pages don't duplicate them.
  const sections: CategorySeoSection[] =
    page === 1 ? (category.sections ?? []) : [];
  const faq: CategoryFaqItem[] = page === 1 ? (category.faq ?? []) : [];
  // The FAQPage markup mirrors the visible FAQ exactly (same questions, same answers).
  const faqMarkup = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${toAbsoluteUrl(path)}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="bg-brand-light text-brand-lilac min-h-screen">
      {/* JSON-LD FAQ — an FAQPage without questions is invalid structured data */}
      {category.indexable &&
        !hasListingFilters(searchParams) &&
        faqMarkup.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqMarkup).replace(/</g, "\\u003c"),
          }}
        />
      )}

      {/* Category Header */}
      <section className="mx-auto max-w-[1350px] px-6 pt-10">
        <h1 className="font-heading text-3xl font-black text-[#012D69]">
          {categoryName}
        </h1>
        {/* The intro only on page 1, so paginated pages don't duplicate it */}
        {page === 1 && (
          <p className="mt-4 text-sm text-[#012D69]/80 max-w-4xl leading-relaxed whitespace-pre-wrap">
            {category.intro?.trim() ||
              `Découvrez ${content.totalItems} ${
                content.totalItems > 1 ? "offres" : "offre"
              } ${category.name} actuellement ${
                content.totalItems > 1 ? "disponibles" : "disponible"
              } sur PlayDepot. Vérifiez sur chaque fiche la plateforme, la région d’activation et le mode de livraison avant votre achat.`}
          </p>
        )}
      </section>

      <CatalogClient
        basePath={path}
        initialContent={content}
        categorySlug={slug}
        isPlateforme={isPlateforme}
        titleAs="h2"
        key={page}
      />

      <CategorySeoContent
        sections={sections}
        faq={faq}
        fallback={
          page === 1 && sections.length === 0
            ? {
                categoryName,
                totalItems: content.totalItems,
                products: content.products.slice(0, 3).map((product) => ({
                  slug: product.slug,
                  title: product.title,
                })),
              }
            : undefined
        }
      />
    </main>
  );
}
