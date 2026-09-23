import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AppError } from "@/lib/utils/app-error";
import { getUserByEmail, getUserById } from "@/repositories/user.repository";
import type { AffiliateSession } from "@/types/entities";

export const AFFILIATE_SESSION_COOKIE = "affiliate_session";
const AFFILIATE_SESSION_DURATION = "30d";
const AFFILIATE_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret =
    process.env.AFFILIATE_SESSION_SECRET?.trim() ??
    process.env.ADMIN_SESSION_SECRET?.trim() ??
    process.env.ADMIN_JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "La variable d'environnement AFFILIATE_SESSION_SECRET est requise pour la connexion affilié.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function authenticateAffiliateUser(
  email: string,
  password: string,
) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("Identifiants invalides.", 401);
  }

  if (user.role !== "affiliate") {
    throw new AppError(
      "Ce compte n'est pas autorisé à accéder à l'espace affilié.",
      403,
    );
  }

  if (!user.isActive) {
    throw new AppError("Ce compte affilié est inactif.", 403);
  }

  const passwordMatches = user.passwordHash
    ? await compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    throw new AppError("Identifiants invalides.", 401);
  }

  return {
    userId: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function createAffiliateSessionToken(payload: {
  userId: string;
  email: string;
}) {
  return new SignJWT({
    email: payload.email,
    role: "affiliate",
    type: "affiliate_session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(AFFILIATE_SESSION_DURATION)
    .sign(getSessionSecret());
}

async function verifyAffiliateSessionToken(
  token: string,
): Promise<AffiliateSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      payload.type !== "affiliate_session" ||
      payload.role !== "affiliate" ||
      typeof payload.email !== "string" ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: "affiliate",
      source: "cookie",
    };
  } catch {
    return null;
  }
}

/**
 * Le JWT prouve seulement qu'une session a été émise à un moment donné : on
 * revérifie systématiquement en base que l'utilisateur existe toujours,
 * qu'il a bien le rôle "affiliate" et qu'il est actif, afin qu'une
 * désactivation ou un changement de rôle décidé côté admin coupe l'accès
 * immédiatement, sans attendre l'expiration du cookie.
 */
async function resolveAffiliateSession(
  cookieValue: string | undefined,
): Promise<AffiliateSession | null> {
  if (!cookieValue) {
    return null;
  }

  const session = await verifyAffiliateSessionToken(cookieValue);

  if (!session) {
    return null;
  }

  const user = await getUserById(session.userId);

  if (!user || user.role !== "affiliate" || !user.isActive) {
    return null;
  }

  return session;
}

export async function getAffiliatePageSession() {
  const cookieStore = await cookies();

  return resolveAffiliateSession(
    cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value,
  );
}

export async function requireAffiliatePageAccess() {
  const session = await getAffiliatePageSession();

  if (!session) {
    redirect("/affiliation/login");
  }

  return session;
}

export async function getAffiliateApiSession(request: NextRequest) {
  return resolveAffiliateSession(
    request.cookies.get(AFFILIATE_SESSION_COOKIE)?.value,
  );
}

export function attachAffiliateSessionCookie(
  response: NextResponse,
  token: string,
) {
  response.cookies.set(AFFILIATE_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AFFILIATE_SESSION_MAX_AGE,
  });

  return response;
}

export function clearAffiliateSessionCookie(response: NextResponse) {
  response.cookies.set(AFFILIATE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
