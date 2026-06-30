import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { promoCodeService } from "@/services/promo-code.service";

type PromoCodeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: PromoCodeRouteContext,
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await promoCodeService.getById(id);

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: PromoCodeRouteContext,
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await promoCodeService.update(id, body);

    revalidatePath("/admin/promos");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: PromoCodeRouteContext,
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await promoCodeService.delete(id);

    revalidatePath("/admin/promos");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
