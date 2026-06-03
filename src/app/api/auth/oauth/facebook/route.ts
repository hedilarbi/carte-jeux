import { NextResponse, type NextRequest } from "next/server";

import {
  createOAuthStateResponse,
  getOAuthRedirectUri,
} from "@/lib/auth/oauth";

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID?.trim();

  if (!appId) {
    return NextResponse.redirect(
      new URL("/connexion?error=facebook_not_configured", request.url),
    );
  }

  const authorizeUrl = new URL("https://www.facebook.com/dialog/oauth");
  authorizeUrl.searchParams.set("client_id", appId);
  authorizeUrl.searchParams.set(
    "redirect_uri",
    getOAuthRedirectUri(request, "facebook"),
  );
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "email,public_profile");

  return createOAuthStateResponse("facebook", authorizeUrl);
}
