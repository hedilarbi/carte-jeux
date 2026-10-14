export type ListingSearchParams = Record<string, string | string[] | undefined>;

// Legacy filter/sort parameters. Listings are filtered client-side and never link
// to these, but old URLs may still be crawled: they stay reachable as
// noindex,follow with a self-referencing canonical.
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

function encodeCanonicalQueryValue(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildListingCanonicalHref(
  basePath: string,
  params: ListingSearchParams,
) {
  const page = readListingPage(params) ?? 1;
  const entries: Array<[string, string]> = [];

  if (page > 1) entries.push(["page", String(page)]);

  for (const key of FILTER_PARAMS) {
    const rawValues = params[key];
    const values = Array.isArray(rawValues) ? rawValues : [rawValues];

    for (const value of values) {
      if (value !== undefined && value !== "") entries.push([key, value]);
    }
  }

  if (entries.length === 0) return basePath;

  const query = entries
    .map(
      ([key, value]) =>
        `${encodeCanonicalQueryValue(key)}=${encodeCanonicalQueryValue(value)}`,
    )
    .join("&");

  return `${basePath}?${query}`;
}

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

export function withPageDescription(description: string, page: number) {
  const normalized = description.replace(/\s+/g, " ").trim();
  const suffix = page > 1 ? ` Page ${page} du catalogue.` : "";
  const maximumBaseLength = 300 - suffix.length;

  if (normalized.length <= maximumBaseLength) {
    return `${normalized}${suffix}`;
  }

  const shortened = normalized.slice(0, maximumBaseLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const cleanEnding = (lastSpace > 80 ? shortened.slice(0, lastSpace) : shortened)
    .replace(/[\s,;:—-]+$/, "");

  return `${cleanEnding}…${suffix}`;
}
