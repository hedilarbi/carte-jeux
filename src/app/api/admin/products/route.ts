import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  parseBooleanParam,
  successResponse,
} from "@/lib/utils/api-response";
import { productService } from "@/services/product.service";

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const data = await productService.list({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      categoryId: searchParams.get("categoryId") ?? undefined,
      platformId: searchParams.get("platformId") ?? undefined,
      regionId: searchParams.get("regionId") ?? undefined,
      isActive: parseBooleanParam(searchParams.get("isActive")),
      isFeatured: parseBooleanParam(searchParams.get("isFeatured")),
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
    const data = await productService.create(body);

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
