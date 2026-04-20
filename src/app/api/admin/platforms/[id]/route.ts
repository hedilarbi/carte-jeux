import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import {
  getFormDataFile,
  getFormDataString,
  getOptionalFormDataBoolean,
} from "@/lib/utils/form-data";
import { mediaService } from "@/services/media.service";
import { platformService } from "@/services/platform.service";

async function resolvePlatformPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return request.json();
  }

  const formData = await request.formData();
  const logoFile = getFormDataFile(formData, "logo");
  const logo = logoFile
    ? await mediaService.uploadPlatformLogo(logoFile)
    : undefined;

  return {
    name: getFormDataString(formData, "name"),
    slug: getFormDataString(formData, "slug"),
    ...(logo ? { logo } : {}),
    isActive: getOptionalFormDataBoolean(formData, "isActive"),
  };
}

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
    const body = await resolvePlatformPayload(request);
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
