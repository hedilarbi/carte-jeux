import type { NextRequest } from "next/server";

import { getFavoritesController } from "@/controllers/favorites.controller";

export async function GET(request: NextRequest) {
  return getFavoritesController(request);
}
