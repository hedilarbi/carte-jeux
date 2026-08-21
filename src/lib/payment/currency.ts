/**
 * Le catalogue contient deux graphies du dinar tunisien : "TND" (le code ISO
 * 4217, sur les imports G2A) et "DTN", saisi à la main sur une partie des
 * produits internes. Les deux désignent la même devise.
 */
const TND_ALIASES = new Set(["TND", "DTN"]);

export function normalizeCurrencyCode(currency: string) {
  const code = currency.trim().toUpperCase();

  return TND_ALIASES.has(code) ? "TND" : code;
}

export function isTunisianDinar(currency: string) {
  return normalizeCurrencyCode(currency) === "TND";
}
