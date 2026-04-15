import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "@/lib/auth/admin";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: {
      loggedOut: true,
    },
  });

  return clearAdminSessionCookie(response);
}
