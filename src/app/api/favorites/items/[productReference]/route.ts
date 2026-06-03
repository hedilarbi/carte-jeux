import type { NextRequest } from "next/server";

import { removeFavoriteController } from "@/controllers/favorites.controller";

type FavoriteRouteContext = {
  params: Promise<{
    productReference: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  context: FavoriteRouteContext,
) {
  const { productReference } = await context.params;

  return removeFavoriteController(
    request,
    decodeURIComponent(productReference),
  );
}
