import { NextResponse, type NextRequest } from "next/server";

import {
  attachCustomerSessionCookie,
  clearCustomerSessionCookie,
  createCustomerSessionToken,
  getCustomerApiSession,
} from "@/lib/auth/customer";
import { CART_SESSION_COOKIE } from "@/lib/auth/cart-session";
import { FAVORITE_SESSION_COOKIE } from "@/lib/auth/favorite-session";
import { getRequestOrigin } from "@/lib/auth/oauth";
import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { attachActiveCartToUser } from "@/repositories/cart.repository";
import { customerAuthService } from "@/services/customer-auth.service";
import { favoritesService } from "@/services/favorites.service";
import type { AuthUser } from "@/types/entities";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function attachCartIfExists(request: NextRequest, userId: string) {
  const cartSessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

  if (!cartSessionId) {
    return;
  }

  await attachActiveCartToUser(cartSessionId, userId);
}

async function attachFavoritesIfExists(request: NextRequest, userId: string) {
  const favoriteSessionId = request.cookies.get(FAVORITE_SESSION_COOKIE)?.value;

  if (!favoriteSessionId) {
    return;
  }

  await favoritesService.attachSessionToUser(favoriteSessionId, userId);
}

async function signedInResponse(
  request: NextRequest,
  user: AuthUser,
  init?: ResponseInit,
) {
  await attachCartIfExists(request, user._id);
  await attachFavoritesIfExists(request, user._id);

  const sessionToken = await createCustomerSessionToken({
    userId: user._id,
    email: user.email,
  });
  const response = successResponse({ user }, init);

  return attachCustomerSessionCookie(response, sessionToken);
}

export async function registerCustomerController(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const user = await customerAuthService.register(body);

    return signedInResponse(request, user, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function loginCustomerController(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const user = await customerAuthService.login(body);

    return signedInResponse(request, user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function logoutCustomerController() {
  const response = NextResponse.json({
    success: true,
    data: {
      loggedOut: true,
    },
  });

  return clearCustomerSessionCookie(response);
}

export async function forgotPasswordController(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const data = await customerAuthService.requestPasswordReset(
      body,
      getRequestOrigin(request),
    );

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function resetPasswordController(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const data = await customerAuthService.resetPassword(body);

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function getCurrentCustomerController(request: NextRequest) {
  try {
    const session = await getCustomerApiSession(request);

    if (!session) {
      return successResponse({ user: null });
    }

    const user = await customerAuthService.getSessionUser(session.userId);

    return successResponse({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
