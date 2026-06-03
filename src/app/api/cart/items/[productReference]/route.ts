import type { NextRequest } from "next/server";

import {
  removeCartItemController,
  updateCartItemController,
} from "@/controllers/cart.controller";

type CartItemRouteContext = {
  params: Promise<{
    productReference: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: CartItemRouteContext,
) {
  const { productReference } = await context.params;

  return updateCartItemController(
    request,
    decodeURIComponent(productReference),
  );
}

export async function DELETE(
  request: NextRequest,
  context: CartItemRouteContext,
) {
  const { productReference } = await context.params;

  return removeCartItemController(
    request,
    decodeURIComponent(productReference),
  );
}
