import type { NextRequest } from "next/server";

import { resendRegistrationOtpController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return resendRegistrationOtpController(request);
}
