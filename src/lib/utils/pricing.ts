export function clampDiscountPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function roundMoney(value: number) {
  return Number.isFinite(value) ? Math.round(Math.max(0, value)) : 0;
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
