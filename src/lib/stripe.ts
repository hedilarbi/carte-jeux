// --- STRIPE DÉSACTIVÉ TEMPORAIREMENT ---
// Le client était instancié au chargement du module : sans STRIPE_SECRET_KEY
// dans l'environnement de build, `new Stripe(...)` lève
// "Neither apiKey nor config.authenticator provided" pendant la collecte des
// pages et fait échouer `next build`.
// Pour réactiver : décommenter, et s'assurer que STRIPE_SECRET_KEY est présent
// à la construction (ou instancier paresseusement dans une fonction).
//
// import Stripe from "stripe";
//
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export {};
