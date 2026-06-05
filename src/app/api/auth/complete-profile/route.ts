import type { NextRequest } from "next/server";

import { completeCustomerProfileController } from "@/controllers/customer-auth.controller";

export async function POST(request: NextRequest) {
  return completeCustomerProfileController(request);
}
