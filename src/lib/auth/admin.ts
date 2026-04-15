import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AppError } from "@/lib/utils/app-error";
import { getUserByEmail } from "@/repositories/user.repository";
import type { AdminSession } from "@/types/entities";

export const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_ROLE_HEADER = "x-admin-role";
const ADMIN_EMAIL_HEADER = "x-admin-email";
const ADMIN_SESSION_DURATION = "7d";

function getConfiguredSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN?.trim();
}

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ??
    process.env.ADMIN_JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "La variable d'environnement ADMIN_SESSION_SECRET est requise pour la connexion admin.",
    );
  }

  return new TextEncoder().encode(secret);
}

function isDevBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_BYPASS === "true"
  );
}

function createDevBypassSession(): AdminSession {
  return {
    userId: "dev-admin",
    email: process.env.ADMIN_DEV_EMAIL ?? "admin@local.test",
    role: "admin",
    source: "dev-bypass",
  };
}

export async function getAdminPageSession(): Promise<AdminSession | null> {
  if (isDevBypassEnabled()) {
    return createDevBypassSession();
  }

  const cookieStore = await cookies();
  const configuredToken = getConfiguredSessionToken();
  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (configuredToken && cookieValue === configuredToken) {
    return {
      userId: "static-token-admin",
      email: process.env.ADMIN_SESSION_EMAIL ?? "admin@eneba.local",
      role: "admin",
      source: "cookie",
    };
  }

  if (!cookieValue) {
    return null;
  }

  return verifyAdminSessionToken(cookieValue);
}

export async function requireAdminPageAccess() {
  const session = await getAdminPageSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function getAdminApiSession(
  request: NextRequest,
): Promise<AdminSession | null> {
  if (isDevBypassEnabled()) {
    return createDevBypassSession();
  }

  const configuredToken = getConfiguredSessionToken();
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (configuredToken && cookieValue === configuredToken) {
    return {
      userId: "static-token-admin",
      email: process.env.ADMIN_SESSION_EMAIL ?? "admin@eneba.local",
      role: "admin",
      source: "cookie",
    };
  }

  if (cookieValue) {
    const session = await verifyAdminSessionToken(cookieValue);

    if (session) {
      return session;
    }
  }

  const role = request.headers.get(ADMIN_ROLE_HEADER);
  const email = request.headers.get(ADMIN_EMAIL_HEADER);

  if (role === "admin" && email) {
    return {
      userId: "header-admin",
      email,
      role: "admin",
      source: "header",
    };
  }

  return null;
}

export async function authenticateAdminUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("Identifiants administrateur invalides.", 401);
  }

  if (user.role !== "admin") {
    throw new AppError(
      "Ce compte n'est pas autorisé à accéder au panneau d'administration.",
      403,
    );
  }

  if (!user.isActive) {
    throw new AppError("Ce compte administrateur est inactif.", 403);
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Identifiants administrateur invalides.", 401);
  }

  return {
    userId: String(user._id),
    email: user.email,
    role: "admin" as const,
  };
}

export async function createAdminSessionToken(payload: {
  userId: string;
  email: string;
}) {
  return new SignJWT({
    email: payload.email,
    role: "admin",
    type: "admin_session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(ADMIN_SESSION_DURATION)
    .sign(getSessionSecret());
}

async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      payload.type !== "admin_session" ||
      payload.role !== "admin" ||
      typeof payload.email !== "string" ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: "admin",
      source: "cookie",
    };
  } catch {
    return null;
  }
}

export function attachAdminSessionCookie(
  response: NextResponse,
  token: string,
) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
