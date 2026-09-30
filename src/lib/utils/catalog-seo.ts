export type ListingSearchParams = Record<string, string | string[] | undefined>;

// Legacy filter/sort parameters. Listings are filtered client-side and never link
// to these, but old URLs may still be crawled: they stay reachable as
// noindex,follow and canonicalise to the clean listing URL.
const FILTER_PARAMS = [
  "platform",
  "type",
  "region",
  "search",
  "q",
  "limit",
  "sort",
  "min",
  "max",
];

// 1 when absent, null when invalid (the page should 404).
export function readListingPage(params: ListingSearchParams) {
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;

  if (rawPage === undefined) {
    return 1;
  }

  if (!/^\d{1,6}$/.test(rawPage)) {
    return null;
  }

  const page = Number(rawPage);
  return page >= 1 ? page : null;
}

export function hasListingFilters(params: ListingSearchParams) {
  return FILTER_PARAMS.some((key) => params[key] !== undefined);
}

export function withPageSuffix(title: string, page: number) {
  return page > 1 ? `${title} - Page ${page}` : title;
}
