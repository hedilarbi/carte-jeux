import { AppError } from "@/lib/utils/app-error";
import type { G2AAuthTokenRecord } from "@/models/g2a-auth-token.model";
import {
  getStoredG2AAuthToken,
  saveG2AAuthToken,
  type SaveG2AAuthTokenInput,
} from "@/repositories/g2a-auth-token.repository";

interface G2AOAuthTokenResponse {
  access_token?: unknown;
  token_type?: unknown;
  expires_in?: unknown;
}

type StoredG2AToken = Pick<
  G2AAuthTokenRecord,
  "accessToken" | "tokenType" | "expiresIn" | "expiresAt"
>;

let pendingTokenRequest: Promise<StoredG2AToken> | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AppError(`Variable d'environnement ${name} manquante.`, 500);
  }

  return value;
}

export function getG2AApiBaseUrl() {
  const rawUrl = getRequiredEnv("G2A_API_URL").replace(/\/+$/, "");

  try {
    const url = new URL(rawUrl);
    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new AppError("La variable G2A_API_URL est invalide.", 500);
  }
}

function getG2ATokenExpirySafetyMs() {
  const rawValue = process.env.G2A_TOKEN_EXPIRY_SAFETY_SECONDS?.trim();

  if (!rawValue) {
    return 60_000;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < 0) {
    throw new AppError(
      "La variable G2A_TOKEN_EXPIRY_SAFETY_SECONDS est invalide.",
      500,
    );
  }

  return value * 1000;
}

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseTokenResponse(data: unknown): SaveG2AAuthTokenInput {
  const payload = data as G2AOAuthTokenResponse;
  const accessToken =
    typeof payload.access_token === "string" ? payload.access_token.trim() : "";
  const tokenType =
    typeof payload.token_type === "string" && payload.token_type.trim()
      ? payload.token_type.trim()
      : "Bearer";
  const expiresIn =
    typeof payload.expires_in === "number"
      ? payload.expires_in
      : Number(payload.expires_in);

  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new AppError("La réponse OAuth G2A est incomplète.", 502);
  }

  return {
    accessToken,
    tokenType,
    expiresIn,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

async function requestNewG2ATokenInternal() {
  const response = await fetch(`${getG2AApiBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getRequiredEnv("G2A_CLIENT_ID"),
      client_secret: getRequiredEnv("G2A_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new AppError("Impossible de récupérer le token OAuth G2A.", 502, {
      status: response.status,
      response: data,
    });
  }

  return saveG2AToken(parseTokenResponse(data));
}

export async function getStoredG2AToken() {
  return getStoredG2AAuthToken();
}

export async function saveG2AToken(tokenData: SaveG2AAuthTokenInput) {
  return saveG2AAuthToken(tokenData);
}

export function isG2ATokenExpired(tokenData: Pick<StoredG2AToken, "expiresAt">) {
  const expiresAt = new Date(tokenData.expiresAt).getTime();

  if (!Number.isFinite(expiresAt)) {
    return true;
  }

  return expiresAt - getG2ATokenExpirySafetyMs() <= Date.now();
}

export async function requestNewG2AToken() {
  if (!pendingTokenRequest) {
    pendingTokenRequest = requestNewG2ATokenInternal().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
}

export async function refreshTokenIfNeeded() {
  const token = await getStoredG2AToken();

  if (!token || isG2ATokenExpired(token)) {
    return requestNewG2AToken();
  }

  return token;
}

export async function getG2AAccessToken() {
  const token = await refreshTokenIfNeeded();
  return token.accessToken;
}

export const g2aAuthService = {
  getG2AAccessToken,
  requestNewG2AToken,
  getStoredG2AToken,
  saveG2AToken,
  isG2ATokenExpired,
  refreshTokenIfNeeded,
};
