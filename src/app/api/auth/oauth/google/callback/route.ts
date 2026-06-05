import { NextResponse, type NextRequest } from "next/server";

import { CART_SESSION_COOKIE } from "@/lib/auth/cart-session";
import { FAVORITE_SESSION_COOKIE } from "@/lib/auth/favorite-session";
import {
  attachCustomerSessionCookie,
  createCustomerSessionToken,
} from "@/lib/auth/customer";
import {
  clearOAuthStateCookie,
  getOAuthRedirectUri,
  validateOAuthState,
} from "@/lib/auth/oauth";
import { attachActiveCartToUser } from "@/repositories/cart.repository";
import { customerAuthService } from "@/services/customer-auth.service";
import { favoritesService } from "@/services/favorites.service";

type GoogleTokenResponse = {
  access_token?: string;
};

type GoogleProfileResponse = {
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  sub?: string;
};

function redirectWithError(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/connexion?error=${error}`, request.url));
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!clientId || !clientSecret) {
    return redirectWithError(request, "google_not_configured");
  }

  if (!validateOAuthState(request, "google", state)) {
    return redirectWithError(request, "invalid_oauth_state");
  }

  if (!code) {
    return redirectWithError(request, "missing_oauth_code");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: getOAuthRedirectUri(request, "google"),
      }),
    });
    const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenPayload.access_token) {
      return redirectWithError(request, "google_token_error");
    }

    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      },
    );
    const profile = (await profileResponse.json()) as GoogleProfileResponse;

    if (
      !profileResponse.ok ||
      !profile.email ||
      !profile.sub ||
      profile.email_verified === false
    ) {
      return redirectWithError(request, "google_profile_error");
    }

    const authResult = await customerAuthService.authenticateOAuth({
      email: profile.email,
      firstName: profile.given_name,
      googleId: profile.sub,
      lastName: profile.family_name,
      provider: "google",
    });
    const { user } = authResult;
    const cartSessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    if (cartSessionId) {
      await attachActiveCartToUser(cartSessionId, user._id);
    }

    const favoriteSessionId = request.cookies.get(FAVORITE_SESSION_COOKIE)?.value;

    if (favoriteSessionId) {
      await favoritesService.attachSessionToUser(favoriteSessionId, user._id);
    }

    const sessionToken = await createCustomerSessionToken({
      userId: user._id,
      email: user.email,
    });
    const response = NextResponse.redirect(
      new URL(
        authResult.requiresProfileCompletion ? "/completer-profil" : "/",
        request.url,
      ),
    );

    clearOAuthStateCookie(response, "google");
    return attachCustomerSessionCookie(response, sessionToken);
  } catch (error) {
    console.error(error);
    return redirectWithError(request, "google_oauth_error");
  }
}
