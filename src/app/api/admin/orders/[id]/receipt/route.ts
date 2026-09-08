import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import { errorResponse, handleRouteError } from "@/lib/utils/api-response";
import { generateReceiptPdf } from "@/services/receipt.service";
import { orderService } from "@/services/order.service";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const order = await orderService.getById(id);
    const pdf = await generateReceiptPdf(order);
    const filename = `Facture-${order.orderNumber}.pdf`;

    return new Response(Buffer.from(pdf), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
