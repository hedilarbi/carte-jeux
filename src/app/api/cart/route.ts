import type { NextRequest } from "next/server";

import {
  clearCartController,
  getCartController,
} from "@/controllers/cart.controller";

export async function GET(request: NextRequest) {
  return getCartController(request);
}

export async function DELETE(request: NextRequest) {
  return clearCartController(request);
}
