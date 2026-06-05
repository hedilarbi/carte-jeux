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

type FacebookTokenResponse = {
  access_token?: string;
};

type FacebookProfileResponse = {
  email?: string;
  first_name?: string;
  id?: string;
  last_name?: string;
};

function redirectWithError(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/connexion?error=${error}`, request.url));
}

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID?.trim();
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!appId || !appSecret) {
    return redirectWithError(request, "facebook_not_configured");
  }

  if (!validateOAuthState(request, "facebook", state)) {
    return redirectWithError(request, "invalid_oauth_state");
  }

  if (!code) {
    return redirectWithError(request, "missing_oauth_code");
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set(
      "redirect_uri",
      getOAuthRedirectUri(request, "facebook"),
    );

    const tokenResponse = await fetch(tokenUrl);
    const tokenPayload = (await tokenResponse.json()) as FacebookTokenResponse;

    if (!tokenResponse.ok || !tokenPayload.access_token) {
      return redirectWithError(request, "facebook_token_error");
    }

    const profileUrl = new URL("https://graph.facebook.com/me");
    profileUrl.searchParams.set("fields", "id,first_name,last_name,email");
    profileUrl.searchParams.set("access_token", tokenPayload.access_token);

    const profileResponse = await fetch(profileUrl);
    const profile = (await profileResponse.json()) as FacebookProfileResponse;

    if (!profileResponse.ok || !profile.email || !profile.id) {
      return redirectWithError(request, "facebook_profile_error");
    }

    const authResult = await customerAuthService.authenticateOAuth({
      email: profile.email,
      facebookId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      provider: "facebook",
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

    clearOAuthStateCookie(response, "facebook");
    return attachCustomerSessionCookie(response, sessionToken);
  } catch (error) {
    console.error(error);
    return redirectWithError(request, "facebook_oauth_error");
  }
}
