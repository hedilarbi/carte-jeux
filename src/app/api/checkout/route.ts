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
import { getSiteBaseUrl } from "@/lib/utils/site-url";
// Force Next.js to recompile this route
import { stripe } from "@/lib/stripe";
import { convertPrice, type Currency } from "@/lib/utils/currency";

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
      currency: body.currency,
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
      gclid: request.cookies.get("playsdepot_gclid")?.value,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/promos");
    revalidatePath("/admin/users");
    revalidatePath("/checkout");
    revalidatePath("/panier");
    revalidatePath("/profil");

    if (parsed.paymentMethod === "clictopay") {
      const baseUrl = getSiteBaseUrl(request);
      const returnUrl = `${baseUrl}/checkout/verification`;
      const { formUrl } = await orderService.startClicToPayPayment({
        orderId: order._id,
        returnUrl,
        failUrl: returnUrl,
      });

      return attachCartSessionCookie(
        successResponse({ order, checkoutUrl: formUrl }, { status: 201 }),
        cartSession,
      );
    }

    if (parsed.paymentMethod === "stripe") {
      const origin = request.nextUrl.origin;
      const chargeCurrency = parsed.currency as Currency;
      // La conversion est faite à l'unité puis multipliée par la quantité :
      // le total facturé n'est donc pas exactement la conversion du total de
      // la commande. On additionne les lignes réellement envoyées à Stripe.
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: chargeCurrency.toLowerCase(),
          product_data: {
            name: item.productTitle,
            metadata: {
              sku: item.sku,
            },
          },
          unit_amount: Math.round(
            convertPrice(item.finalUnitPrice, chargeCurrency) * 100,
          ),
        },
        quantity: item.quantity,
      }));
      const chargeTotal =
        lineItems.reduce(
          (sum, line) => sum + line.price_data.unit_amount * line.quantity,
          0,
        ) / 100;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: parsed.customerEmail,
        client_reference_id: order.paymentReference,
        line_items: lineItems,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_number=${order.orderNumber}`,
        cancel_url: `${origin}/checkout`,
      });

      const chargedOrder = await orderService.recordPaymentCharge({
        orderId: order._id,
        paymentCurrency: chargeCurrency,
        paymentTotal: chargeTotal,
      });

      return attachCartSessionCookie(
        successResponse(
          { order: chargedOrder, checkoutUrl: session.url },
          { status: 201 },
        ),
        cartSession,
      );
    }

    return attachCartSessionCookie(
      successResponse({ order, checkoutUrl: null }, { status: 201 }),
      cartSession,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
