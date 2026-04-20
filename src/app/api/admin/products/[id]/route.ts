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
  getFormDataFiles,
  getFormDataNumber,
  getFormDataString,
  getFormDataStrings,
  getOptionalFormDataBoolean,
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
    isFeatured: getOptionalFormDataBoolean(formData, "isFeatured"),
    isActive: getOptionalFormDataBoolean(formData, "isActive"),
    seoTitle: getFormDataString(formData, "seoTitle"),
    seoDescription: getFormDataString(formData, "seoDescription"),
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
    const data = await productService.getById(id);
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
    const body = await resolveProductPayload(request);
    const data = await productService.update(id, body);

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");

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
    const data = await productService.delete(id);

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
