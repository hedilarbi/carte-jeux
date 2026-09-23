import { NextResponse, type NextRequest } from "next/server";

import {
  attachAffiliateSessionCookie,
  authenticateAffiliateUser,
  createAffiliateSessionToken,
} from "@/lib/auth/affiliate";
import { handleRouteError } from "@/lib/utils/api-response";
import { affiliateLoginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credentials = affiliateLoginSchema.parse(body);
    const affiliateUser = await authenticateAffiliateUser(
      credentials.email,
      credentials.password,
    );
    const sessionToken = await createAffiliateSessionToken({
      userId: affiliateUser.userId,
      email: affiliateUser.email,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: affiliateUser,
      },
    });

    return attachAffiliateSessionCookie(response, sessionToken);
  } catch (error) {
    return handleRouteError(error);
  }
}
