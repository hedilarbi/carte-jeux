export function buildProductsHref(categorySlug?: string | null) {
  if (!categorySlug) {
    return "/produits";
  }

  return `/produits?q=${encodeURIComponent(categorySlug)}`;
}
