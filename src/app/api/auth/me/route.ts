import type { NextRequest } from "next/server";

import { getCurrentCustomerController } from "@/controllers/customer-auth.controller";

export async function GET(request: NextRequest) {
  return getCurrentCustomerController(request);
}
