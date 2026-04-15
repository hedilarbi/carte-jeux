import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { orderService } from "@/services/order.service";
import type { OrderStatus, PaymentStatus } from "@/types/entities";

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const data = await orderService.list({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: (searchParams.get("status") as OrderStatus | null) ?? undefined,
      paymentStatus:
        (searchParams.get("paymentStatus") as PaymentStatus | null) ??
        undefined,
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
