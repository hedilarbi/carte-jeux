import type { NextRequest } from "next/server";

import {
  applyPromoCodeController,
  removePromoCodeController,
} from "@/controllers/cart.controller";

export async function POST(request: NextRequest) {
  return applyPromoCodeController(request);
}

export async function DELETE(request: NextRequest) {
  return removePromoCodeController(request);
}
