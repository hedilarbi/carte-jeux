import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import type { CustomerSession } from "@/types/entities";

export const CUSTOMER_SESSION_COOKIE = "customer_session";
const CUSTOMER_SESSION_DURATION = "30d";
const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET?.trim() ??
    process.env.AUTH_SESSION_SECRET?.trim() ??
    process.env.ADMIN_SESSION_SECRET?.trim() ??
    process.env.ADMIN_JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "La variable d'environnement CUSTOMER_SESSION_SECRET est requise pour la connexion client.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createCustomerSessionToken(payload: {
  email: string;
  userId: string;
}) {
  return new SignJWT({
    email: payload.email,
    role: "customer",
    type: "customer_session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(CUSTOMER_SESSION_DURATION)
    .sign(getSessionSecret());
}

async function verifyCustomerSessionToken(
  token: string,
): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      payload.type !== "customer_session" ||
      payload.role !== "customer" ||
      typeof payload.email !== "string" ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: "customer",
      source: "cookie",
    };
  } catch {
    return null;
  }
}

export async function getCustomerPageSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  return verifyCustomerSessionToken(cookieValue);
}

export async function getCustomerApiSession(request: NextRequest) {
  const cookieValue = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  return verifyCustomerSessionToken(cookieValue);
}

export function attachCustomerSessionCookie(
  response: NextResponse,
  token: string,
) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  });

  return response;
}

export function clearCustomerSessionCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
