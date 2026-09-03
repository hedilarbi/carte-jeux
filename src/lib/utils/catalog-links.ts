const PLATFORMS = new Set([
  "psn", "xbox", "steam", "nintendo", "jeu-mobile", "epic-games", "ea-sports", "jeux-pc",
  "android-ios", "airlinegift", "amazon", "apple", "autodesk", "by-rewarble", "cryptovoucher",
  "google-play", "in-game", "netflix", "nintendo-eshop", "razer", "roblox", "starbucks",
  "the-elder-scrolls-online", "ubisoft-connect", "xbox-live", "albertsons", "cashtocode",
  "decathlon", "ea-app", "giftmecrypto", "mastercard", "microsoft", "riot", "adidas", "binance",
  "grab", "ikea", "sephora"
]);

export function buildProductsHref(categorySlug?: string | null) {
  if (!categorySlug) {
    return "/produits";
  }

  if (PLATFORMS.has(categorySlug)) {
    return `/categories/plateformes/${categorySlug}/`;
  }

  return `/categories/types/${categorySlug}/`;
}
