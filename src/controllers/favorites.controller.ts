import type { NextRequest } from "next/server";

import { getCustomerApiSession } from "@/lib/auth/customer";
import {
  attachFavoriteSessionCookie,
  resolveFavoriteSession,
} from "@/lib/auth/favorite-session";
import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import {
  favoritesService,
  type FavoriteOwner,
} from "@/services/favorites.service";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function resolveFavoriteOwner(
  request: NextRequest,
  createSessionIfMissing = false,
) {
  const customerSession = await getCustomerApiSession(request);
  const favoriteSession = resolveFavoriteSession(
    request,
    createSessionIfMissing && !customerSession,
  );
  const owner: FavoriteOwner = customerSession
    ? { userId: customerSession.userId }
    : { sessionId: favoriteSession.sessionId };

  return {
    favoriteSession,
    owner,
  };
}

export async function getFavoritesController(request: NextRequest) {
  try {
    const { favoriteSession, owner } = await resolveFavoriteOwner(request);
    const data = await favoritesService.get(owner);

    return attachFavoriteSessionCookie(successResponse(data), favoriteSession);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function addFavoriteController(request: NextRequest) {
  try {
    const { favoriteSession, owner } = await resolveFavoriteOwner(request, true);
    const body = await readJsonBody(request);
    const data = await favoritesService.add(owner, body);

    return attachFavoriteSessionCookie(
      successResponse(data, { status: 201 }),
      favoriteSession,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function removeFavoriteController(
  request: NextRequest,
  productReference: string,
) {
  try {
    const { favoriteSession, owner } = await resolveFavoriteOwner(request);
    const data = await favoritesService.remove(owner, productReference);

    return attachFavoriteSessionCookie(successResponse(data), favoriteSession);
  } catch (error) {
    return handleRouteError(error);
  }
}
