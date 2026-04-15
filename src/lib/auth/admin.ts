import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import type { AdminSession } from "@/types/entities";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_ROLE_HEADER = "x-admin-role";
const ADMIN_EMAIL_HEADER = "x-admin-email";

function getConfiguredSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN?.trim();
}

function isDevBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_BYPASS === "true"
  );
}

function createDevBypassSession(): AdminSession {
  return {
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
      email: process.env.ADMIN_SESSION_EMAIL ?? "admin@eneba.local",
      role: "admin",
      source: "cookie",
    };
  }

  return null;
}

export async function requireAdminPageAccess() {
  const session = await getAdminPageSession();

  if (!session) {
    redirect("/");
  }

  return session;
}

export function getAdminApiSession(request: NextRequest): AdminSession | null {
  if (isDevBypassEnabled()) {
    return createDevBypassSession();
  }

  const configuredToken = getConfiguredSessionToken();
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (configuredToken && cookieValue === configuredToken) {
    return {
      email: process.env.ADMIN_SESSION_EMAIL ?? "admin@eneba.local",
      role: "admin",
      source: "cookie",
    };
  }

  const role = request.headers.get(ADMIN_ROLE_HEADER);
  const email = request.headers.get(ADMIN_EMAIL_HEADER);

  if (role === "admin" && email) {
    return {
      email,
      role: "admin",
      source: "header",
    };
  }

  return null;
}
