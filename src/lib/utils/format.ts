/**
 * Le dinar est affiché sans décimales, comme partout sur le site. Les autres
 * devises en gardent deux : arrondir un montant en euros à l'unité fausserait
 * ce que le client a réellement payé.
 */
const WHOLE_UNIT_CURRENCIES = new Set(["TND", "DTN"]);

/**
 * Le catalogue contient deux graphies du dinar tunisien, "TND" et "DTN".
 * Elles désignent la même devise : sans cette normalisation, un paiement en
 * dinars sur une commande libellée en DTN passerait pour une conversion.
 */
function normalizeCurrencyCode(currency: string) {
  const code = currency.toUpperCase();

  return code === "DTN" ? "TND" : code;
}

export function formatCurrency(value: number, currency = "USD") {
  const normalizedCurrency = currency.toUpperCase();
  const fractionDigits = WHOLE_UNIT_CURRENCIES.has(normalizedCurrency) ? 0 : 2;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Montant réellement débité au client, avec sa devise.
 *
 * Le catalogue est libellé en dinars, mais un client hors Tunisie paie en
 * euros via Stripe : afficher `total`/`currency` à l'administrateur lui
 * montrerait une somme qui n'a jamais été encaissée. On préfère donc le
 * couple `paymentTotal`/`paymentCurrency` dès qu'il est renseigné, et on
 * retombe sur la commande pour l'historique et les commandes WhatsApp.
 */
export function formatOrderCharge(order: {
  currency: string;
  paymentCurrency?: string;
  paymentTotal?: number;
  total: number;
}) {
  const hasCharge =
    typeof order.paymentTotal === "number" && Boolean(order.paymentCurrency);
  const currency = hasCharge
    ? (order.paymentCurrency as string)
    : order.currency;
  const amount = hasCharge ? (order.paymentTotal as number) : order.total;
  const isConverted =
    hasCharge &&
    normalizeCurrencyCode(currency) !== normalizeCurrencyCode(order.currency);

  return {
    /** Ce que le client a payé, à afficher en premier. */
    charged: formatCurrency(amount, currency),
    /** Code ISO de la devise réellement débitée. */
    chargedCurrency: currency.toUpperCase(),
    isConverted,
  };
}
