

export type Currency = "TND" | "EUR" | "MAD";

const TND_PER_EUR = 4;

export const MOROCCO_PRICING = {
  currency: "MAD",
  rate: 10.9,
  gateways: {
    stripe: {
      feePct: 0.029,
      feeFixedEur: 0.25,
    },
  },
  margin: 1.3,
  rounding: 5,
  defaultGateway: "stripe",
} as const;

function roundUpToIncrement(value: number, increment: number) {
  return Math.ceil(value / increment) * increment;
}

function convertTndPriceToMad(priceInTND: number) {
  const priceInEur = priceInTND / TND_PER_EUR;
  const priceWithMargin = priceInEur * MOROCCO_PRICING.margin;
  const stripe = MOROCCO_PRICING.gateways.stripe;
  const priceIncludingStripeFees =
    (priceWithMargin + stripe.feeFixedEur) / (1 - stripe.feePct);
  const priceInMad = priceIncludingStripeFees * MOROCCO_PRICING.rate;

  return roundUpToIncrement(priceInMad, MOROCCO_PRICING.rounding);
}

export function convertPrice(priceInTND: number, targetCurrency: Currency): number {
  if (targetCurrency === "EUR") {
    const eurPrice = (priceInTND / TND_PER_EUR) * 1.1;
    // Round to 2 decimal places properly
    return Math.round(eurPrice * 100) / 100;
  }

  if (targetCurrency === "MAD") {
    return convertTndPriceToMad(priceInTND);
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

  if (currency === "MAD") {
    return `${convertedPrice.toLocaleString("fr-MA", { maximumFractionDigits: 0 })} MAD`;
  }
  
  // TND generally has no decimals or we can format it as integer
  return `${Math.round(convertedPrice)} TND`;
}
