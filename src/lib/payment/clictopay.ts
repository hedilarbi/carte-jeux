import { AppError } from "@/lib/utils/app-error";

/**
 * Intégration de la passerelle monétique ClicToPay (API REST « IPAY »).
 *
 * Deux appels seulement :
 *  - `register.do`                → crée la commande et renvoie l'URL du formulaire de paiement
 *  - `getOrderStatusExtended.do`  → donne le statut réel de la transaction
 *
 * La configuration est lue paresseusement (et non au chargement du module) pour
 * qu'un build sans variables d'environnement ne casse pas, et pour que les
 * valeurs soient toujours celles réellement présentes à l'exécution.
 */

const DEFAULT_BASE_URL = "https://test.clictopay.com/payment/rest";

/** Code ISO 4217 du dinar tunisien. */
const TND_ISO_CODE = "788";

/**
 * Le catalogue contient deux graphies du dinar tunisien : "TND" (ISO 4217, les
 * imports G2A) et "DTN", saisi à la main sur une partie des produits internes.
 * Les deux désignent la même devise et donc le même code ISO 788.
 */
const TND_CURRENCY_ALIASES = new Set(["TND", "DTN"]);

export function isTunisianDinar(currency: string) {
  return TND_CURRENCY_ALIASES.has(currency.trim().toUpperCase());
}
/** Le dinar tunisien se divise en 1000 millimes : ClicToPay attend des millimes. */
const TND_MINOR_UNIT_FACTOR = 1000;

interface ClicToPayConfig {
  userName: string;
  password: string;
  baseUrl: string;
  language: string;
  acceptPreAuthorized: boolean;
}

interface ClicToPayResponse {
  errorCode?: string | number;
  errorMessage?: string;
  orderId?: string;
  formUrl?: string;
  orderStatus?: number;
  orderNumber?: string;
  amount?: number | string;
  currency?: string;
  actionCode?: number;
  actionCodeDescription?: string;
}

export interface ClicToPayRegistration {
  orderId: string;
  formUrl: string;
}

export interface ClicToPayVerification {
  orderStatus: number | null;
  isPaid: boolean;
  orderNumber?: string;
  amount: number;
  currency?: string;
  actionCode?: number;
  /** Motif d'échec en français, prêt à être affiché au client. */
  failureReason?: string;
  /** Texte brut renvoyé par la passerelle (anglais), réservé aux logs. */
  rawDescription?: string;
}

/**
 * ClicToPay renvoie `actionCodeDescription` en anglais quelle que soit la
 * valeur du paramètre `language`. Ce texte n'est jamais montré au client : on
 * traduit les motifs courants, et tout ce qui n'est pas reconnu retombe sur un
 * message générique en français — jamais sur l'anglais d'origine.
 */
const FAILURE_TRANSLATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /no payment attempted/i,
    "Aucun paiement n'a été effectué : la transaction a été abandonnée avant d'être validée.",
  ],
  [
    /insufficient funds|not sufficient/i,
    "La provision sur votre carte est insuffisante.",
  ],
  [/expired card|card has expired/i, "La carte utilisée est expirée."],
  [
    /issuer bank is not able|unable to process|cannot process transaction/i,
    "Votre banque n'a pas pu traiter la transaction. Contactez-la ou utilisez une autre carte.",
  ],
  [
    /lost card|stolen card|restricted card|blocked/i,
    "Cette carte ne permet pas de réaliser ce paiement. Contactez votre banque.",
  ],
  [
    /invalid card|incorrect card|invalid card number|invalid cvc|invalid cvv/i,
    "Les informations de la carte saisies sont invalides.",
  ],
  [
    /exceeds.*limit|limit exceeded|withdrawal limit/i,
    "Le plafond de paiement de votre carte est atteint.",
  ],
  [
    /3-?d ?secure|authentication failed|authentication unavailable/i,
    "L'authentification 3-D Secure n'a pas abouti.",
  ],
  [
    /timed out|time-?out|session (has )?expired/i,
    "La session de paiement a expiré. Merci de recommencer votre commande.",
  ],
  [
    /do not honou?r|declined|rejected|refused/i,
    "La transaction a été refusée par votre banque.",
  ],
];

const GENERIC_FAILURE_REASON =
  "Le paiement n'a pas abouti. Aucun montant ne vous a été débité.";

/** Traduit en français le motif d'échec renvoyé par la passerelle. */
export function translateFailureReason(description?: string) {
  if (!description?.trim()) {
    return GENERIC_FAILURE_REASON;
  }

  for (const [pattern, message] of FAILURE_TRANSLATIONS) {
    if (pattern.test(description)) {
      return message;
    }
  }

  return GENERIC_FAILURE_REASON;
}

export function isClicToPayConfigured() {
  return Boolean(
    process.env.CLICTOPAY_API_USER?.trim() &&
      process.env.CLICTOPAY_API_PASSWORD?.trim(),
  );
}

function getConfig(): ClicToPayConfig {
  const userName = process.env.CLICTOPAY_API_USER?.trim();
  const password = process.env.CLICTOPAY_API_PASSWORD?.trim();

  if (!userName || !password) {
    throw new AppError(
      "Le paiement par carte bancaire n'est pas configuré.",
      503,
    );
  }

  return {
    userName,
    password,
    baseUrl: (
      process.env.CLICTOPAY_BASE_URL?.trim() || DEFAULT_BASE_URL
    ).replace(/\/+$/, ""),
    language: process.env.CLICTOPAY_LANGUAGE?.trim() || "fr",
    // `orderStatus = 1` signifie « pré-autorisé », pas encaissé. Certains
    // environnements de test ne dépassent jamais cet état : on ne l'accepte
    // que si c'est demandé explicitement, jamais par défaut.
    acceptPreAuthorized: process.env.CLICTOPAY_ACCEPT_PREAUTHORIZED === "true",
  };
}

async function callClicToPay(
  endpoint: "register.do" | "getOrderStatusExtended.do",
  params: Record<string, string>,
) {
  const config = getConfig();
  const body = new URLSearchParams({
    userName: config.userName,
    password: config.password,
    language: config.language,
    ...params,
  });

  let payload: ClicToPayResponse;

  try {
    const response = await fetch(`${config.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    payload = (await response.json()) as ClicToPayResponse;

    // Réponse brute de la passerelle, succès comme échec. La requête n'est
    // jamais tracée : elle contient le mot de passe du compte marchand.
    console.log(
      `[clictopay] ${endpoint} →`,
      JSON.stringify(payload, null, 2),
    );
  } catch (error) {
    console.error(`[clictopay] ${endpoint} injoignable.`, error);
    throw new AppError(
      "La passerelle de paiement est momentanément indisponible.",
      502,
    );
  }

  const errorCode = String(payload.errorCode ?? "0");

  if (errorCode !== "0") {
    console.error(
      `[clictopay] ${endpoint} a renvoyé l'erreur ${errorCode}: ${payload.errorMessage}`,
    );
    throw new AppError(
      payload.errorMessage?.trim() || "Le paiement a été refusé.",
      502,
    );
  }

  return payload;
}

/** Convertit un montant en dinars vers l'unité minimale attendue (millimes). */
export function toMillimes(amount: number) {
  return Math.round(Number(amount) * TND_MINOR_UNIT_FACTOR);
}

/**
 * Enregistre la commande auprès de ClicToPay et renvoie l'URL du formulaire de
 * paiement vers laquelle rediriger le client.
 */
export async function registerPayment(input: {
  amount: number;
  currency: string;
  orderNumber: string;
  returnUrl: string;
  failUrl?: string;
  customerEmail?: string;
  description?: string;
}): Promise<ClicToPayRegistration> {
  if (!isTunisianDinar(input.currency)) {
    throw new AppError(
      "ClicToPay n'accepte que les paiements en dinar tunisien (TND).",
      422,
    );
  }

  const amountInMillimes = toMillimes(input.amount);

  if (!Number.isFinite(amountInMillimes) || amountInMillimes <= 0) {
    throw new AppError("Le montant à payer est invalide.", 422);
  }

  const payload = await callClicToPay("register.do", {
    orderNumber: input.orderNumber,
    amount: String(amountInMillimes),
    currency: TND_ISO_CODE,
    returnUrl: input.returnUrl,
    failUrl: input.failUrl || input.returnUrl,
    ...(input.customerEmail ? { email: input.customerEmail } : {}),
    ...(input.description ? { description: input.description } : {}),
  });

  if (!payload.orderId || !payload.formUrl) {
    throw new AppError(
      "Réponse inattendue de la passerelle de paiement.",
      502,
    );
  }

  return {
    orderId: payload.orderId,
    formUrl: payload.formUrl,
  };
}

/** Interroge ClicToPay pour connaître le statut réel d'une transaction. */
export async function verifyPayment(input: {
  transactionId: string;
}): Promise<ClicToPayVerification> {
  const payload = await callClicToPay("getOrderStatusExtended.do", {
    orderId: input.transactionId,
  });

  const config = getConfig();
  const orderStatus =
    typeof payload.orderStatus === "number" ? payload.orderStatus : null;
  // 2 = paiement encaissé. 1 = pré-autorisé (fonds bloqués, non débités).
  const isPaid =
    orderStatus === 2 || (config.acceptPreAuthorized && orderStatus === 1);

  return {
    orderStatus,
    isPaid,
    orderNumber: payload.orderNumber,
    amount: payload.amount ? Number(payload.amount) / TND_MINOR_UNIT_FACTOR : 0,
    currency: payload.currency,
    actionCode: payload.actionCode,
    failureReason: isPaid
      ? undefined
      : translateFailureReason(payload.actionCodeDescription),
    rawDescription: payload.actionCodeDescription,
  };
}
