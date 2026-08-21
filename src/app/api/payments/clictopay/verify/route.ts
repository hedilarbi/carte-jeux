import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { orderService } from "@/services/order.service";

/**
 * Appelée au retour du client depuis la page de paiement ClicToPay.
 * Le statut n'est jamais déduit des paramètres d'URL : il est redemandé à la
 * passerelle via `getOrderStatusExtended.do`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      transactionId?: string;
    };
    const result = await orderService.confirmClicToPayPayment(
      body.transactionId ?? "",
    );

    if (!result.alreadyProcessed) {
      revalidatePath("/admin");
      revalidatePath("/admin/orders");
      revalidatePath("/profil");
    }

    return successResponse({
      failureReason: result.failureReason ?? null,
      orderNumber: result.order.orderNumber,
      paymentStatus: result.paymentStatus,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
