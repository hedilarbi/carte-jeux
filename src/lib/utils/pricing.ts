export function clampDiscountPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function calculateDiscountedPrice(price: number, discountPercent = 0) {
  const normalizedPrice = Number.isFinite(price) ? Math.max(0, price) : 0;
  const normalizedDiscount = clampDiscountPercent(discountPercent);
  const discountAmount = normalizedPrice * (normalizedDiscount / 100);

  return roundMoney(normalizedPrice - discountAmount);
}
