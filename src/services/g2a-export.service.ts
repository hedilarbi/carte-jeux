import { g2aJsonRequest } from "@/services/g2a-client.service";

const PRODUCT_DETAILS_BATCH_SIZE = 20;
const G2A_PRODUCT_OFFERS_ITEMS_PER_PAGE_VALUES = [10, 20, 50, 100] as const;

export interface G2AOffer {
  id?: string;
  offerId?: string;
  price?: number | string;
  quantity?: number | string;
  currency?: string;
  [key: string]: unknown;
}

export interface G2AProductOffer {
  id?: string;
  productId?: string;
  offers?: G2AOffer[];
  totalQuantity?: number;
  [key: string]: unknown;
}

export interface G2AProductDetails {
  id?: string;
  productId?: string;
  name?: string;
  slug?: string;
  thumbnail?: string;
  portraitImage?: string;
  images?: string[];
  categories?: Array<string | { name?: string }>;
  platform?: string;
  region?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  [key: string]: unknown;
}

export interface G2APaginatedResponse<T> {
  data?: T[];
  items?: T[];
  total?: number;
  totalPages?: number;
  page?: number;
  itemsPerPage?: number;
  [key: string]: unknown;
}

function toFiniteNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeProductIds(productIds: string[]) {
  return Array.from(
    new Set(productIds.map((productId) => productId.trim()).filter(Boolean)),
  );
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getResponseItems<T>(response: G2APaginatedResponse<T> | null) {
  return response?.data ?? response?.items ?? [];
}

function normalizeProductOffersItemsPerPage(itemsPerPage: number) {
  return G2A_PRODUCT_OFFERS_ITEMS_PER_PAGE_VALUES.includes(
    itemsPerPage as (typeof G2A_PRODUCT_OFFERS_ITEMS_PER_PAGE_VALUES)[number],
  )
    ? itemsPerPage
    : 100;
}

export function chooseCheapestAvailableOffer(offers: G2AOffer[] = []) {
  return offers.reduce<G2AOffer | null>((selectedOffer, offer) => {
    const price = toFiniteNumber(offer.price);
    const quantity = toFiniteNumber(offer.quantity);

    if (price === null || quantity === null || quantity <= 0) {
      return selectedOffer;
    }

    if (!selectedOffer) {
      return offer;
    }

    const selectedPrice = toFiniteNumber(selectedOffer.price);

    if (selectedPrice === null || price < selectedPrice) {
      return offer;
    }

    return selectedOffer;
  }, null);
}

export function getG2AProductMainImage(product: G2AProductDetails) {
  return product.portraitImage?.trim() || product.thumbnail?.trim() || undefined;
}

export async function fetchG2AProductOffers(page = 1, itemsPerPage = 100) {
  const params = new URLSearchParams({
    page: String(page),
    itemsPerPage: String(normalizeProductOffersItemsPerPage(itemsPerPage)),
  });

  return g2aJsonRequest<G2APaginatedResponse<G2AProductOffer>>(
    `/export/v1/product-offers?${params.toString()}`,
  );
}

async function fetchG2AProductOffersByProductIdsBatch(productIds: string[]) {
  const params = new URLSearchParams({
    itemsPerPage: String(normalizeProductOffersItemsPerPage(100)),
  });

  productIds.forEach((productId) => {
    params.append("productIds[]", productId);
  });

  if (!productIds.length) {
    return null;
  }

  return g2aJsonRequest<G2APaginatedResponse<G2AProductOffer>>(
    `/export/v1/product-offers?${params.toString()}`,
  );
}

export async function fetchG2AProductOffersByProductIds(productIds: string[]) {
  const normalizedProductIds = normalizeProductIds(productIds);
  const productOffers: G2AProductOffer[] = [];

  for (const batch of chunk(normalizedProductIds, 100)) {
    const response = await fetchG2AProductOffersByProductIdsBatch(batch);
    productOffers.push(...getResponseItems(response));
  }

  return productOffers;
}

async function fetchG2AProductDetailsBatch(productIds: string[]) {
  const params = new URLSearchParams();

  productIds.forEach((productId) => {
    params.append("productIds[]", productId);
  });

  if (!params.size) {
    return null;
  }

  return g2aJsonRequest<G2APaginatedResponse<G2AProductDetails>>(
    `/export/v1/products?${params.toString()}`,
  );
}

export async function fetchG2AProductDetails(productIds: string[]) {
  const normalizedProductIds = normalizeProductIds(productIds);
  const products: G2AProductDetails[] = [];

  for (const batch of chunk(normalizedProductIds, PRODUCT_DETAILS_BATCH_SIZE)) {
    const response = await fetchG2AProductDetailsBatch(batch);
    products.push(...getResponseItems(response));
  }

  return products;
}

export const g2aExportService = {
  fetchG2AProductOffers,
  fetchG2AProductOffersByProductIds,
  fetchG2AProductDetails,
  chooseCheapestAvailableOffer,
  getG2AProductMainImage,
};
