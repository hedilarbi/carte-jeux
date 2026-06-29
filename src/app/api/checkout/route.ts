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
import { customerAuthService } from "@/services/customer-auth.service";
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
    const customerUser = customerSession
      ? await customerAuthService.getSessionUser(customerSession.userId)
      : null;
    const body = await readJsonBody(request);
    const parsed = checkoutCreateSchema.parse({
      ...body,
      customerFirstName: customerUser?.firstName ?? body.customerFirstName,
      customerLastName: customerUser?.lastName ?? body.customerLastName,
      customerEmail:
        customerUser?.email ?? body.customerEmail ?? customerSession?.email,
      customerPhone: body.customerPhone ?? customerUser?.phone,
      paymentMethod: body.paymentMethod,
    });
    const order = await orderService.createFromCart({
      customerEmail: parsed.customerEmail,
      customerFirstName: parsed.customerFirstName,
      customerLastName: parsed.customerLastName,
      customerPhone: parsed.customerPhone,
      guestCustomer: customerSession
        ? undefined
        : {
            email: parsed.customerEmail,
            firstName: parsed.customerFirstName,
            lastName: parsed.customerLastName,
            phone: parsed.customerPhone,
          },
      paymentProvider: parsed.paymentMethod,
      sessionId: cartSession.sessionId,
      userId: customerSession?.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/users");
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
