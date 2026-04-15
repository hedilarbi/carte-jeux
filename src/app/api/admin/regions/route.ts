import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  parseBooleanParam,
  successResponse,
} from "@/lib/utils/api-response";
import { regionService } from "@/services/region.service";

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const data = await regionService.list({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      isActive: parseBooleanParam(searchParams.get("isActive")),
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json();
    const data = await regionService.create(body);

    revalidatePath("/admin/regions");
    revalidatePath("/admin/products");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
