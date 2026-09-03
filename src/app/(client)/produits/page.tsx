import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CatalogClient from "@/components/site/products/CatalogClient";
import { catalogService } from "@/services/catalog.service";

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasOldFilters =
    params.platform ||
    params.type ||
    params.region ||
    params.search ||
    params.page ||
    params.limit;

  if (hasOldFilters) {
    return {
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: "https://playsdepot.com/produits",
      },
    };
  }

  return {
    alternates: {
      canonical: "https://playsdepot.com/produits",
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const content = await catalogService.getProductsPageContent({
    limit: readSearchParam(params.limit),
    max: readSearchParam(params.max),
    min: readSearchParam(params.min),
    page: readSearchParam(params.page),
    platform: params.platform,
    q: readSearchParam(params.q),
    region: params.region,
    search: readSearchParam(params.search),
    sort: readSearchParam(params.sort),
    type: params.type,
  });

  const page = parseInt(readSearchParam(params.page) ?? "1", 10);
  if (page > 1 && page > content.pagination.totalPages) {
    notFound();
  }

  return (
    <main className="bg-brand-light text-brand-lilac">
      <CatalogClient initialContent={content} />
    </main>
  );
}
