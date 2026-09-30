import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
  withPageSuffix,
} from "@/lib/utils/catalog-seo";
import { CategoryModel } from "@/models/category.model";

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
  const title = withPageSuffix(
    category.seoTitle || `${category.name} - PlayDepot`,
    page,
  );
  const description = category.metaDescription || category.description;
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
  const faqMarkup = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${toAbsoluteUrl(path)}#faq`,
    mainEntity: [], // In the future, parse intro or dedicated FAQ items
  };

  return (
    <main className="bg-brand-light text-brand-lilac min-h-screen">
      {/* JSON-LD FAQ — an FAQPage without questions is invalid structured data */}
      {category.indexable && faqMarkup.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqMarkup) }}
        />
      )}

      {/* Category Header */}
      <section className="mx-auto max-w-[1350px] px-6 pt-10">
        <h1 className="font-heading text-3xl font-black text-[#012D69]">
          {category.h1 || category.name}
        </h1>
        {/* The intro only on page 1, so paginated pages don't duplicate it */}
        {category.intro && page === 1 && (
          <p className="mt-4 text-sm text-[#012D69]/80 max-w-4xl leading-relaxed whitespace-pre-wrap">
            {category.intro}
          </p>
        )}
      </section>

      <CatalogClient
        basePath={path}
        initialContent={content}
        categorySlug={slug}
        isPlateforme={isPlateforme}
        key={page}
      />
    </main>
  );
}
