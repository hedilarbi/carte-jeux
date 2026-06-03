import type { NextRequest } from "next/server";

import { addFavoriteController } from "@/controllers/favorites.controller";

export async function POST(request: NextRequest) {
  return addFavoriteController(request);
}
