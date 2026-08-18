import Stripe from "stripe";

// Pas d'`apiVersion` explicite : le SDK épingle lui-même la version de l'API
// qu'il supporte (celle de ses types). La forcer ici casse la compilation à
// chaque montée de version du paquet `stripe`.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
