import { NextResponse, type NextRequest } from "next/server";

export const FAVORITE_SESSION_COOKIE = "favorite_session_id";
const FAVORITE_SESSION_MAX_AGE = 60 * 60 * 24 * 180;

export interface FavoriteSession {
  isNew: boolean;
  sessionId?: string;
}

export function resolveFavoriteSession(
  request: NextRequest,
  createIfMissing = true,
): FavoriteSession {
  const existingSessionId = request.cookies.get(FAVORITE_SESSION_COOKIE)?.value;

  if (existingSessionId) {
    return {
      isNew: false,
      sessionId: existingSessionId,
    };
  }

  if (!createIfMissing) {
    return {
      isNew: false,
    };
  }

  return {
    isNew: true,
    sessionId: crypto.randomUUID(),
  };
}

export function attachFavoriteSessionCookie(
  response: NextResponse,
  session: FavoriteSession,
) {
  if (!session.isNew || !session.sessionId) {
    return response;
  }

  response.cookies.set(FAVORITE_SESSION_COOKIE, session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FAVORITE_SESSION_MAX_AGE,
  });

  return response;
}
