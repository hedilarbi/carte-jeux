import { NextResponse, type NextRequest } from "next/server";

export const CART_SESSION_COOKIE = "cart_session_id";
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export interface CartSession {
  isNew: boolean;
  sessionId: string;
}

export function resolveCartSession(request: NextRequest): CartSession {
  const existingSessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

  if (existingSessionId) {
    return {
      isNew: false,
      sessionId: existingSessionId,
    };
  }

  return {
    isNew: true,
    sessionId: crypto.randomUUID(),
  };
}

export function attachCartSessionCookie(
  response: NextResponse,
  session: CartSession,
) {
  if (!session.isNew) {
    return response;
  }

  response.cookies.set(CART_SESSION_COOKIE, session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_SESSION_MAX_AGE,
  });

  return response;
}
