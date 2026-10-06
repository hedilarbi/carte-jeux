import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { affiliateService } from "@/services/affiliate.service";

type AffiliateRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  context: AffiliateRouteContext,
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await affiliateService.update(id, body);

    revalidatePath("/admin/affiliates");
    revalidatePath("/admin/promos");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: AffiliateRouteContext,
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await affiliateService.delete(id);

    revalidatePath("/admin/affiliates");
    revalidatePath("/admin/promos");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
