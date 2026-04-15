import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { categoryService } from "@/services/category.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getAdminApiSession(request)) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await categoryService.getById(id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getAdminApiSession(request)) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await categoryService.update(id, body);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getAdminApiSession(request)) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await categoryService.delete(id);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
