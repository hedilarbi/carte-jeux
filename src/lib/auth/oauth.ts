import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

type OAuthProvider = "google" | "facebook";

const OAUTH_STATE_MAX_AGE = 60 * 10;

function getStateCookieName(provider: OAuthProvider) {
  return `oauth_state_${provider}`;
}

export function getRequestOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin;
}

export function getOAuthRedirectUri(
  request: NextRequest,
  provider: OAuthProvider,
) {
  const envValue =
    provider === "google"
      ? process.env.GOOGLE_REDIRECT_URI?.trim()
      : process.env.FACEBOOK_REDIRECT_URI?.trim();

  return envValue || `${getRequestOrigin(request)}/api/auth/oauth/${provider}/callback`;
}

export function createOAuthStateResponse(
  provider: OAuthProvider,
  redirectUrl: URL,
) {
  const state = randomUUID();
  redirectUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(getStateCookieName(provider), state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  });

  return response;
}

export function validateOAuthState(
  request: NextRequest,
  provider: OAuthProvider,
  state: string | null,
) {
  const cookieName = getStateCookieName(provider);
  const cookieState = request.cookies.get(cookieName)?.value;

  return Boolean(state && cookieState && state === cookieState);
}

export function clearOAuthStateCookie(
  response: NextResponse,
  provider: OAuthProvider,
) {
  response.cookies.set(getStateCookieName(provider), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
