import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CatalogClient from "@/components/site/products/CatalogClient";
import { toAbsoluteUrl } from "@/lib/utils/catalog-links";
import {
  buildListingCanonicalHref,
  hasListingFilters,
  type ListingSearchParams,
  readListingPage,
  withPageDescription,
  withPageSuffix,
} from "@/lib/utils/catalog-seo";
import { catalogService } from "@/services/catalog.service";

const PRODUCTS_PATH = "/produits";
const PRODUCTS_TITLE = "Produits gaming en Tunisie";
const PRODUCTS_DESCRIPTION =
  "Achetez vos jeux vidéo, cartes cadeaux et recharges gaming en Tunisie sur PlayDepot.";

type ProductsPageProps = {
  searchParams: Promise<ListingSearchParams>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = readListingPage(params) ?? 1;

  return {
    title: {
      absolute: `${withPageSuffix(PRODUCTS_TITLE, page)} | PlayDepot`,
    },
    description: withPageDescription(PRODUCTS_DESCRIPTION, page),
    // Every listing URL is self-canonical. Legacy filters remain noindex,follow,
    // while paginated clean listings stay indexable.
    alternates: {
      canonical: toAbsoluteUrl(buildListingCanonicalHref(PRODUCTS_PATH, params)),
    },
    ...(hasListingFilters(params)
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = readListingPage(params);

  if (page === null) {
    notFound();
  }

  const content = await catalogService.getProductsPageContent({
    max: readSearchParam(params.max),
    min: readSearchParam(params.min),
    page: String(page),
    platform: params.platform,
    q: readSearchParam(params.q),
    region: params.region,
    search: readSearchParam(params.search),
    sort: readSearchParam(params.sort),
    type: params.type,
  });

  if (page > content.pagination.totalPages) {
    notFound();
  }

  return (
    <main className="bg-brand-light text-brand-lilac">
      <CatalogClient
        basePath={PRODUCTS_PATH}
        initialContent={content}
        key={page}
      />
    </main>
  );
}
