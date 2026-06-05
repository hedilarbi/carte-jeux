import type { NextRequest } from "next/server";

import { verifyRegistrationOtpController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return verifyRegistrationOtpController(request);
}
