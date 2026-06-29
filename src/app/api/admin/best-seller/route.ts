import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { bestSellerService } from "@/services/best-seller.service";

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const data = await bestSellerService.list();
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json();
    const data = await bestSellerService.update(body);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/best-seller");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
