import { NextResponse } from "next/server";

import { clearAffiliateSessionCookie } from "@/lib/auth/affiliate";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: {
      loggedOut: true,
    },
  });

  return clearAffiliateSessionCookie(response);
}
