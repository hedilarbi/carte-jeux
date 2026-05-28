import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  parseBooleanParam,
  successResponse,
} from "@/lib/utils/api-response";
import { AppError } from "@/lib/utils/app-error";
import {
  getFormDataBoolean,
  getFormDataFile,
  getFormDataString,
} from "@/lib/utils/form-data";
import { categoryService } from "@/services/category.service";
import { mediaService } from "@/services/media.service";

async function resolveCategoryPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return request.json();
  }

  const formData = await request.formData();
  const imageFile = getFormDataFile(formData, "image");

  if (getFormDataBoolean(formData, "hasImageSelection") && !imageFile) {
    throw new AppError(
      "L'image de catégorie n'a pas été reçue par le serveur. Rechargez la page et réessayez.",
      400,
    );
  }

  const image = imageFile
    ? await mediaService.uploadCategoryImage(imageFile)
    : undefined;

  return {
    name: getFormDataString(formData, "name"),
    slug: getFormDataString(formData, "slug"),
    description: getFormDataString(formData, "description"),
    ...(image ? { image } : {}),
    isPlateforme: getFormDataBoolean(formData, "isPlateforme", false),
    isActive: getFormDataBoolean(formData, "isActive", true),
  };
}

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const data = await categoryService.list({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      isActive: parseBooleanParam(searchParams.get("isActive")),
      isPlateforme: parseBooleanParam(searchParams.get("isPlateforme")),
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
    const body = await resolveCategoryPayload(request);
    const data = await categoryService.create(body);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
