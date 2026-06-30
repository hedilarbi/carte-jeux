import type { NextRequest } from "next/server";

import {
  attachCartSessionCookie,
  resolveCartSession,
} from "@/lib/auth/cart-session";
import { getCustomerApiSession } from "@/lib/auth/customer";
import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { cartService } from "@/services/cart.service";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function getCartController(request: NextRequest) {
  const session = resolveCartSession(request);

  try {
    const data = await cartService.getCart(session.sessionId);
    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function clearCartController(request: NextRequest) {
  const session = resolveCartSession(request);

  try {
    const data = await cartService.clear(session.sessionId);
    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function addCartItemController(request: NextRequest) {
  const session = resolveCartSession(request);

  try {
    const body = await readJsonBody(request);
    const data = await cartService.addItem(session.sessionId, body);

    return attachCartSessionCookie(successResponse(data, { status: 201 }), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function updateCartItemController(
  request: NextRequest,
  productReference: string,
) {
  const session = resolveCartSession(request);

  try {
    const body = await readJsonBody(request);
    const data = await cartService.updateItem(
      session.sessionId,
      productReference,
      body,
    );

    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function removeCartItemController(
  request: NextRequest,
  productReference: string,
) {
  const session = resolveCartSession(request);

  try {
    const data = await cartService.removeItem(session.sessionId, productReference);

    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function applyPromoCodeController(request: NextRequest) {
  const session = resolveCartSession(request);

  try {
    const body = await readJsonBody(request);
    const customerSession = await getCustomerApiSession(request);
    const data = await cartService.applyPromoCode(
      session.sessionId,
      body,
      customerSession?.userId,
    );

    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function removePromoCodeController(request: NextRequest) {
  const session = resolveCartSession(request);

  try {
    const data = await cartService.removePromoCode(session.sessionId);

    return attachCartSessionCookie(successResponse(data), session);
  } catch (error) {
    return handleRouteError(error);
  }
}
