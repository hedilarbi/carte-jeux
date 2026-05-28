import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { categoryService } from "@/services/category.service";

export async function PATCH(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json();
    const data = await categoryService.reorder(body);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
