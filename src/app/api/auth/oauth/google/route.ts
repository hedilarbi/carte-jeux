import { NextResponse, type NextRequest } from "next/server";

import {
  createOAuthStateResponse,
  getOAuthRedirectUri,
} from "@/lib/auth/oauth";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/connexion?error=google_not_configured", request.url),
    );
  }

  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", getOAuthRedirectUri(request, "google"));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("prompt", "select_account");

  return createOAuthStateResponse("google", authorizeUrl);
}
