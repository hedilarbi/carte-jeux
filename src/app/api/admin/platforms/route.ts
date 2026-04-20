import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  parseBooleanParam,
  successResponse,
} from "@/lib/utils/api-response";
import {
  getFormDataBoolean,
  getFormDataFile,
  getFormDataString,
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
    isActive: getFormDataBoolean(formData, "isActive", true),
  };
}

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const data = await platformService.list({
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
    const body = await resolvePlatformPayload(request);
    const data = await platformService.create(body);

    revalidatePath("/admin/platforms");
    revalidatePath("/admin/products");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
