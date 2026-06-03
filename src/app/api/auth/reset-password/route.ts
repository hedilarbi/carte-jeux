import type { NextRequest } from "next/server";

import { resetPasswordController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return resetPasswordController(request);
}
