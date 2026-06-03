import type { NextRequest } from "next/server";

import { loginCustomerController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return loginCustomerController(request);
}
