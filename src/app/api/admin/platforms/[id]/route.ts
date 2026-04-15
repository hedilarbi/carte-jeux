import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { platformService } from "@/services/platform.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await platformService.getById(id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await platformService.update(id, body);

    revalidatePath("/admin/platforms");
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
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await platformService.delete(id);

    revalidatePath("/admin/platforms");
    revalidatePath("/admin/products");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
