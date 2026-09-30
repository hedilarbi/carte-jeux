export const SITE_URL = "https://playsdepot.com";

const PLATFORMS = new Set([
  "psn", "xbox", "steam", "nintendo", "jeu-mobile", "epic-games", "ea-sports", "jeux-pc",
  "android-ios", "airlinegift", "amazon", "apple", "autodesk", "by-rewarble", "cryptovoucher",
  "google-play", "in-game", "netflix", "nintendo-eshop", "razer", "roblox", "starbucks",
  "the-elder-scrolls-online", "ubisoft-connect", "xbox-live", "albertsons", "cashtocode",
  "decathlon", "ea-app", "giftmecrypto", "mastercard", "microsoft", "riot", "adidas", "binance",
  "grab", "ikea", "sephora"
]);

// Category URLs have no trailing slash: Next.js answers "/x/" with a 308 to "/x",
// so a trailing slash would turn every internal link and canonical into a redirect.
export function buildCategoryHref(slug: string, isPlateforme: boolean) {
  return `/categories/${isPlateforme ? "plateformes" : "types"}/${slug}`;
}

export function buildProductsHref(categorySlug?: string | null) {
  if (!categorySlug) {
    return "/produits";
  }

  return buildCategoryHref(categorySlug, PLATFORMS.has(categorySlug));
}

export function buildPaginatedHref(basePath: string, page: number) {
  return page > 1 ? `${basePath}?page=${page}` : basePath;
}

export function toAbsoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

// Canonicals entered in the admin may still carry the old trailing slash.
export function normalizeCanonicalUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}
