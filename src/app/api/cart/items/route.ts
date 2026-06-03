import type { NextRequest } from "next/server";

import { addCartItemController } from "@/controllers/cart.controller";

export async function POST(request: NextRequest) {
  return addCartItemController(request);
}
