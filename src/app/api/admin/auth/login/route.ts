import { NextResponse, type NextRequest } from "next/server";

import {
  attachAdminSessionCookie,
  authenticateAdminUser,
  createAdminSessionToken,
} from "@/lib/auth/admin";
import { handleRouteError } from "@/lib/utils/api-response";
import { adminLoginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credentials = adminLoginSchema.parse(body);
    const adminUser = await authenticateAdminUser(
      credentials.email,
      credentials.password,
    );
    const sessionToken = await createAdminSessionToken({
      userId: adminUser.userId,
      email: adminUser.email,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: adminUser,
      },
    });

    return attachAdminSessionCookie(response, sessionToken);
  } catch (error) {
    return handleRouteError(error);
  }
}
