import type { NextRequest } from "next/server";

import { forgotPasswordController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return forgotPasswordController(request);
}
