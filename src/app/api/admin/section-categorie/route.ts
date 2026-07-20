import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { homeCategorySectionService } from "@/services/home-category-section.service";

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    return successResponse(await homeCategorySectionService.list());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const data = await homeCategorySectionService.update(await request.json());

    revalidatePath("/");
    revalidatePath("/admin/section-categorie");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
