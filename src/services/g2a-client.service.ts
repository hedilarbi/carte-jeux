import { AppError } from "@/lib/utils/app-error";
import {
  getG2AAccessToken,
  getG2AApiBaseUrl,
  requestNewG2AToken,
} from "@/services/g2a-auth.service";

export interface G2ARequestOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
}

function buildG2AUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${getG2AApiBaseUrl()}/`).toString();
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

function buildRequestHeaders(headers: HeadersInit | undefined, accessToken: string) {
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Authorization", `Bearer ${accessToken}`);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  return requestHeaders;
}

async function executeG2ARequest(
  path: string,
  options: G2ARequestOptions,
  accessToken: string,
) {
  return fetch(buildG2AUrl(path), {
    ...options,
    headers: buildRequestHeaders(options.headers, accessToken),
    cache: options.cache ?? "no-store",
  });
}

function getG2AErrorMessage(response: Response) {
  if (response.status === 401) {
    return "Authentification G2A refusée après renouvellement du token.";
  }

  return `Requête G2A échouée (${response.status}).`;
}

export async function g2aRequest(path: string, options: G2ARequestOptions = {}) {
  const accessToken = await getG2AAccessToken();
  let response = await executeG2ARequest(path, options, accessToken);

  if (response.status === 401) {
    const refreshedToken = await requestNewG2AToken();
    response = await executeG2ARequest(path, options, refreshedToken.accessToken);
  }

  if (!response.ok) {
    const details = await readResponseBody(response);

    throw new AppError(getG2AErrorMessage(response), 502, {
      path,
      status: response.status,
      response: details,
    });
  }

  return response;
}

export async function g2aJsonRequest<T>(
  path: string,
  options: G2ARequestOptions = {},
) {
  const response = await g2aRequest(path, options);
  const data = await readResponseBody(response);

  return data as T;
}

export const g2aClientService = {
  g2aRequest,
  g2aJsonRequest,
};
