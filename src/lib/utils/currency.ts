

export type Currency = "TND" | "EUR";

export function convertPrice(priceInTND: number, targetCurrency: Currency): number {
  if (targetCurrency === "EUR") {
    const eurPrice = (priceInTND / 4) * 1.1;
    // Round to 2 decimal places properly
    return Math.round(eurPrice * 100) / 100;
  }
  return priceInTND;
}

export function formatPriceWithCurrency(priceInTND: number, currency: Currency): string {
  const convertedPrice = convertPrice(priceInTND, currency);
  
  if (currency === "EUR") {
    // Format with up to 2 decimal places, replacing dot with comma for FR locale style if preferred,
    // or just toString() since convertPrice already limits to 2 decimal places.
    return `${convertedPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
  }
  
  // TND generally has no decimals or we can format it as integer
  return `${Math.round(convertedPrice)} TND`;
}
