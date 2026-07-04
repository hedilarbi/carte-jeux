import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import {
  chooseCheapestAvailableOffer,
  fetchG2AProductDetails,
  fetchG2AProductOffers,
  getG2AProductMainImage,
  type G2AOffer,
  type G2AProductDetails,
  type G2AProductOffer,
} from "@/services/g2a-export.service";
import {
  getG2AProductMappingContext,
  mapG2AToLocalProductPreview,
} from "@/services/g2a-product-mapping.service";

const TEST_PRODUCT_LIMIT = 3;
const G2A_MIN_ITEMS_PER_PAGE = 10;

function getResponseItems<T>(response: { data?: T[]; items?: T[] } | null) {
  return response?.data ?? response?.items ?? [];
}

function getStringField(record: Record<string, unknown>, field: string) {
  const value = record[field];

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getNestedStringField(
  record: Record<string, unknown>,
  nestedField: string,
  field: string,
) {
  const nested = record[nestedField];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return undefined;
  }

  return getStringField(nested as Record<string, unknown>, field);
}

function getProductId(productOffer: G2AProductOffer) {
  const record = productOffer as Record<string, unknown>;

  return (
    getStringField(record, "productId") ??
    getStringField(record, "id") ??
    getNestedStringField(record, "product", "id") ??
    getNestedStringField(record, "product", "productId")
  );
}

function getOfferId(offer: G2AOffer | null) {
  if (!offer) {
    return undefined;
  }

  const record = offer as Record<string, unknown>;

  return (
    getStringField(record, "id") ??
    getStringField(record, "offerId") ??
    getStringField(record, "sellerOfferId")
  );
}

function toFiniteNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getDetailsId(details: G2AProductDetails) {
  const record = details as Record<string, unknown>;

  return getStringField(record, "productId") ?? getStringField(record, "id");
}

function getDetailsMap(details: G2AProductDetails[]) {
  return new Map(
    details
      .map((item) => [getDetailsId(item), item] as const)
      .filter((item): item is [string, G2AProductDetails] => Boolean(item[0])),
  );
}

async function handleG2ATest(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const offersResponse = await fetchG2AProductOffers(
      1,
      G2A_MIN_ITEMS_PER_PAGE,
    );
    const productOffers = getResponseItems(offersResponse).slice(
      0,
      TEST_PRODUCT_LIMIT,
    );
    const productIds = productOffers
      .map(getProductId)
      .filter((productId): productId is string => Boolean(productId));
    const [details, mappingContext] = await Promise.all([
      fetchG2AProductDetails(productIds),
      getG2AProductMappingContext(),
    ]);
    const detailsMap = getDetailsMap(details);

    return successResponse({
      requested: {
        page: 1,
        itemsPerPage: TEST_PRODUCT_LIMIT,
      },
      received: {
        productOffers: productOffers.length,
        productIds: productIds.length,
        productDetails: details.length,
      },
      products: productOffers.map((productOffer) => {
        const productId = getProductId(productOffer);
        const selectedOffer = chooseCheapestAvailableOffer(productOffer.offers);
        const detail = productId ? detailsMap.get(productId) : undefined;

        return {
          productId,
          offerCount: productOffer.offers?.length ?? 0,
          selectedOffer: selectedOffer
            ? {
                id: getOfferId(selectedOffer),
                price: toFiniteNumber(selectedOffer.price),
                quantity: toFiniteNumber(selectedOffer.quantity),
                currency: selectedOffer.currency,
              }
            : null,
          details: detail
            ? {
                name: detail.name,
                slug: detail.slug,
                mainImage: getG2AProductMainImage(detail),
                portraitImage: detail.portraitImage,
                thumbnail: detail.thumbnail,
                platform: detail.platform,
                region: detail.region,
                developer: detail.developer,
                publisher: detail.publisher,
                releaseDate: detail.releaseDate,
              }
            : null,
          localProductPreview: mapG2AToLocalProductPreview({
            productOffer,
            productDetails: detail,
            context: mappingContext,
          }),
        };
      }),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  return handleG2ATest(request);
}

export async function GET(request: NextRequest) {
  return handleG2ATest(request);
}
