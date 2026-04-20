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
  getFormDataFiles,
  getFormDataNumber,
  getFormDataString,
  getFormDataStrings,
} from "@/lib/utils/form-data";
import { mediaService } from "@/services/media.service";
import { productService } from "@/services/product.service";

async function resolveProductPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return request.json();
  }

  const formData = await request.formData();
  const imageFile = getFormDataFile(formData, "image");
  const galleryFiles = getFormDataFiles(formData, "gallery");
  const image = imageFile
    ? await mediaService.uploadProductImage(imageFile)
    : undefined;
  const gallery = galleryFiles.length
    ? await mediaService.uploadProductGallery(galleryFiles)
    : undefined;
  const regionIds = getFormDataStrings(formData, "regionIds");
  const legacyRegionId = getFormDataString(formData, "regionId");

  return {
    title: getFormDataString(formData, "title"),
    slug: getFormDataString(formData, "slug"),
    shortDescription: getFormDataString(formData, "shortDescription"),
    description: getFormDataString(formData, "description"),
    ...(image ? { image } : {}),
    ...(gallery ? { gallery } : {}),
    categoryId: getFormDataString(formData, "categoryId"),
    platformId: getFormDataString(formData, "platformId"),
    regionIds: regionIds.length
      ? regionIds
      : legacyRegionId
        ? [legacyRegionId]
        : [],
    faceValue: getFormDataNumber(formData, "faceValue"),
    currency: getFormDataString(formData, "currency"),
    price: getFormDataNumber(formData, "price"),
    discountPercent: getFormDataNumber(formData, "discountPercent"),
    sku: getFormDataString(formData, "sku"),
    productType: getFormDataString(formData, "productType"),
    isFeatured: getFormDataBoolean(formData, "isFeatured", false),
    isActive: getFormDataBoolean(formData, "isActive", true),
    seoTitle: getFormDataString(formData, "seoTitle"),
    seoDescription: getFormDataString(formData, "seoDescription"),
  };
}

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
    const body = await resolveProductPayload(request);
    const data = await productService.create(body);

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
