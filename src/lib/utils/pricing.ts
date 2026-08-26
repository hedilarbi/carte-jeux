export function clampDiscountPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function roundMoney(value: number) {
  return Number.isFinite(value) ? Math.round(Math.max(0, value)) : 0;
}

/**
 * Arrondi au centime, pour les devises à sous-unité comme l'euro.
 * `roundMoney` arrondit à l'unité, ce qui convient au dinar affiché sans
 * décimales mais transforme 18,70 € en 19 €.
 */
export function roundToCents(value: number) {
  return Number.isFinite(value)
    ? Math.round(Math.max(0, value) * 100) / 100
    : 0;
}

export function calculateDiscountedPrice(price: number, discountPercent = 0) {
  const normalizedPrice = roundMoney(price);
  const normalizedDiscount = clampDiscountPercent(discountPercent);
  const discountAmount = normalizedPrice * (normalizedDiscount / 100);

  return roundMoney(normalizedPrice - discountAmount);
}

export function formatProductPrice(value: number) {
  return String(roundMoney(value));
}
