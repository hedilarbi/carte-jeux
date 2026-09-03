import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CatalogClient from "@/components/site/products/CatalogClient";
import { catalogService } from "@/services/catalog.service";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CategoryModel } from "@/models/category.model";

export async function generateCategoryMetadata(
  slug: string,
  isPlateforme: boolean
): Promise<Metadata> {
  await connectToDatabase();
  const category = await CategoryModel.findOne({ slug, isPlateforme }).lean();

  if (!category || !category.isActive) {
    return {};
  }

  const title = category.seoTitle || `${category.name} - PlayDepot`;
  const description = category.metaDescription || category.description;
  const canonical =
    category.canonical ||
    `https://playsdepot.com/categories/${isPlateforme ? "plateformes" : "types"}/${slug}/`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !!category.indexable,
      follow: true,
    },
  };
}

export default async function CategoryPageTemplate({
  slug,
  isPlateforme,
}: {
  slug: string;
  isPlateforme: boolean;
}) {
  await connectToDatabase();
  const category = await CategoryModel.findOne({ slug, isPlateforme }).lean();

  if (!category || !category.isActive) {
    notFound();
  }

  const content = await catalogService.getProductsPageContent({
    limit: "12",
    [isPlateforme ? "platform" : "type"]: slug,
  });

  const faqMarkup = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `https://playsdepot.com/categories/${isPlateforme ? "plateformes" : "types"}/${slug}/#faq`,
    mainEntity: [], // In the future, parse intro or dedicated FAQ items
  };

  return (
    <main className="bg-brand-light text-brand-lilac min-h-screen">
      {/* JSON-LD FAQ */}
      {category.indexable && (
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
        {category.intro && (
          <p className="mt-4 text-sm text-[#012D69]/80 max-w-4xl leading-relaxed whitespace-pre-wrap">
            {category.intro}
          </p>
        )}
      </section>

      <CatalogClient
        initialContent={content}
        categorySlug={slug}
        isPlateforme={isPlateforme}
      />
    </main>
  );
}
