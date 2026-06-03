import { revalidatePath } from "next/cache";
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
import { checkoutCreateSchema } from "@/lib/validation/checkout";
import { orderService } from "@/services/order.service";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const cartSession = resolveCartSession(request);

  try {
    const customerSession = await getCustomerApiSession(request);
    const body = await readJsonBody(request);
    const parsed = checkoutCreateSchema.parse({
      ...body,
      customerEmail: customerSession?.email ?? body.customerEmail,
      paymentMethod: "floussi",
    });
    const order = await orderService.createFromCart({
      customerEmail: parsed.customerEmail,
      paymentProvider: parsed.paymentMethod,
      sessionId: cartSession.sessionId,
      userId: customerSession?.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/checkout");
    revalidatePath("/panier");
    revalidatePath("/profil");

    return attachCartSessionCookie(
      successResponse(order, { status: 201 }),
      cartSession,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
