import type { NextRequest } from "next/server";

import { registerCustomerController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return registerCustomerController(request);
}
