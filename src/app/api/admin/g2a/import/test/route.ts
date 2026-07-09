import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { g2aProductImportService } from "@/services/g2a-product-import.service";

function getNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export async function POST(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = await g2aProductImportService.importFirstProducts({
      page: getNumberValue(body.page),
      limit: getNumberValue(body.limit),
    });

    if (data.summary.created > 0 || data.summary.updated > 0) {
      revalidatePath("/");
      revalidatePath("/produits");
      revalidatePath("/admin");
      revalidatePath("/admin/products");
    }

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
