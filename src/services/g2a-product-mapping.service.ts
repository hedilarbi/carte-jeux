import { calculateDiscountedPrice, roundMoney } from "@/lib/utils/pricing";
import { generateSlug } from "@/lib/utils/slug";
import { serializeDocument } from "@/lib/utils/serialization";
import { listAllActiveCategories } from "@/repositories/category.repository";
import { listAllRegions } from "@/repositories/region.repository";
import {
  chooseCheapestAvailableOffer,
  getG2AProductMainImage,
  type G2AOffer,
  type G2AProductDetails,
  type G2AProductOffer,
} from "@/services/g2a-export.service";
import type { Category, ProductType, Region } from "@/types/entities";

interface G2AProductMappingContext {
  categories: Category[];
  regions: Region[];
}

interface RelationMatch {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  matchedBy?: NameMatchReason;
  score?: number;
  sourceName?: string;
}

interface LocalProductPreviewPayload {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  gallery: string[];
  categoryId: string | null;
  categoryIds: string[];
  platformId: string | null;
  regionId: string | null;
  regionIds: string[];
  faceValue: number;
  currency: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  sku: string;
  productType: ProductType;
  deliveryMode: "manual_email";
  isFeatured: boolean;
  isActive: boolean;
  faqItems: [];
  seoTitle?: string;
  seoDescription?: string;
}

interface G2AExtensionPreview {
  supplier: "g2a";
  stock: number;
  autoPricing: boolean;
  g2a: {
    productId?: string;
    selectedOfferId?: string;
    buyPrice?: number;
    supplierStock: number;
    currency?: string;
    platform?: string;
    region?: string;
    developer?: string;
    publisher?: string;
    releaseDate?: string;
    lastSyncedAt: string;
    lastCatalogSyncedAt: string;
  };
}

type UnknownRecord = Record<string, unknown>;
type NameMatchReason =
  | "exact"
  | "contains"
  | "token-overlap"
  | "similarity";

interface NameMatch<T> {
  item: T;
  matchedBy: NameMatchReason;
  score: number;
  sourceName: string;
}

const MIN_RELATION_MATCH_SCORE = 0.62;
const REGION_ALIAS_ENTRIES: Array<[string, string[]]> = [
  ["global", ["global", "worldwide", "world", "row", "rest of world"]],
  ["row", ["global", "worldwide", "world", "row", "rest of world"]],
  ["united states", ["united states", "united states of america", "usa", "us", "etats unis", "états unis"]],
  ["usa", ["united states", "united states of america", "usa", "us", "etats unis", "états unis"]],
  ["us", ["united states", "united states of america", "usa", "us", "etats unis", "états unis"]],
  ["united kingdom", ["united kingdom", "uk", "gb", "great britain", "royaume uni"]],
  ["uk", ["united kingdom", "uk", "gb", "great britain", "royaume uni"]],
  ["gb", ["united kingdom", "uk", "gb", "great britain", "royaume uni"]],
  ["brazil", ["brazil", "brasil", "bresil", "brésil", "br"]],
  ["br", ["brazil", "brasil", "bresil", "brésil", "br"]],
  ["japan", ["japan", "japon", "jp"]],
  ["jp", ["japan", "japon", "jp"]],
  ["europe", ["europe", "eu"]],
  ["eu", ["europe", "eu"]],
];
const REGION_ALIASES = new Map(
  REGION_ALIAS_ENTRIES.map(([key, aliases]) => [
    normalizeName(key),
    Array.from(new Set(aliases.flatMap((alias) => [alias, normalizeName(alias)]))),
  ]),
);

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function tokenizeName(value: string) {
  return normalizeName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function getExpandedTokens(value: string) {
  const tokens = new Set(tokenizeName(value));

  if (tokens.has("psn") || tokens.has("ps4") || tokens.has("ps5")) {
    tokens.add("playstation");
  }

  if (tokens.has("playstation")) {
    tokens.add("psn");
  }

  if (tokens.has("pc") || tokens.has("windows")) {
    tokens.add("computer");
  }

  if (tokens.has("switch")) {
    tokens.add("nintendo");
  }

  if (tokens.has("nintendo")) {
    tokens.add("switch");
  }

  return Array.from(tokens);
}

function getLevenshteinDistance(left: string, right: string) {
  const matrix = Array.from({ length: left.length + 1 }, (_, rowIndex) =>
    Array.from({ length: right.length + 1 }, (_, columnIndex) =>
      rowIndex === 0 ? columnIndex : columnIndex === 0 ? rowIndex : 0,
    ),
  );

  for (let rowIndex = 1; rowIndex <= left.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= right.length; columnIndex += 1) {
      const cost = left[rowIndex - 1] === right[columnIndex - 1] ? 0 : 1;
      matrix[rowIndex][columnIndex] = Math.min(
        matrix[rowIndex - 1][columnIndex] + 1,
        matrix[rowIndex][columnIndex - 1] + 1,
        matrix[rowIndex - 1][columnIndex - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function scoreNameSimilarity(sourceName: string, localName: string) {
  const normalizedSource = normalizeName(sourceName);
  const normalizedLocal = normalizeName(localName);

  if (!normalizedSource || !normalizedLocal) {
    return null;
  }

  if (normalizedSource === normalizedLocal) {
    return { matchedBy: "exact" as const, score: 1 };
  }

  const shortest =
    normalizedSource.length < normalizedLocal.length
      ? normalizedSource
      : normalizedLocal;
  const longest =
    normalizedSource.length >= normalizedLocal.length
      ? normalizedSource
      : normalizedLocal;

  if (shortest.length >= 3 && longest.includes(shortest)) {
    return { matchedBy: "contains" as const, score: 0.92 };
  }

  const sourceTokens = getExpandedTokens(sourceName);
  const localTokens = getExpandedTokens(localName);
  const sourceTokenSet = new Set(sourceTokens);
  const localTokenSet = new Set(localTokens);
  const intersection = sourceTokens.filter((token) => localTokenSet.has(token));
  const union = new Set([...sourceTokens, ...localTokens]);

  if (intersection.length > 0) {
    const shortestTokenCount = Math.min(sourceTokenSet.size, localTokenSet.size);
    const jaccardScore = intersection.length / union.size;

    if (intersection.length === shortestTokenCount) {
      return { matchedBy: "token-overlap" as const, score: 0.84 };
    }

    if (jaccardScore >= 0.45) {
      return {
        matchedBy: "token-overlap" as const,
        score: 0.68 + jaccardScore * 0.2,
      };
    }
  }

  if (shortest.length >= 5) {
    const distance = getLevenshteinDistance(normalizedSource, normalizedLocal);
    const similarityScore = 1 - distance / Math.max(1, longest.length);

    if (similarityScore >= 0.78) {
      return { matchedBy: "similarity" as const, score: similarityScore };
    }
  }

  return null;
}

function findBestNameMatch<T>(
  items: T[],
  sourceNames: string[],
  getItemName: (item: T) => string,
) {
  let bestMatch: NameMatch<T> | null = null;

  for (const sourceName of sourceNames) {
    for (const item of items) {
      const score = scoreNameSimilarity(sourceName, getItemName(item));

      if (!score || score.score < MIN_RELATION_MATCH_SCORE) {
        continue;
      }

      if (!bestMatch || score.score > bestMatch.score) {
        bestMatch = {
          item,
          matchedBy: score.matchedBy,
          score: Number(score.score.toFixed(3)),
          sourceName,
        };
      }
    }
  }

  return bestMatch;
}

function getRegionAliases(value: string) {
  return REGION_ALIASES.get(normalizeName(value)) ?? [];
}

function getRegionSourceNames(regionName?: string) {
  if (!regionName) {
    return [];
  }

  return Array.from(new Set([regionName, ...getRegionAliases(regionName)]));
}

function getLocalRegionNames(region: Region) {
  return Array.from(
    new Set([
      region.name,
      region.code,
      ...getRegionAliases(region.name),
      ...getRegionAliases(region.code),
    ]),
  );
}

function findBestRegionMatch(regions: Region[], sourceNames: string[]) {
  let bestMatch: NameMatch<Region> | null = null;

  for (const sourceName of sourceNames) {
    for (const region of regions) {
      for (const localName of getLocalRegionNames(region)) {
        const score = scoreNameSimilarity(sourceName, localName);

        if (!score || score.score < MIN_RELATION_MATCH_SCORE) {
          continue;
        }

        if (!bestMatch || score.score > bestMatch.score) {
          bestMatch = {
            item: region,
            matchedBy: score.matchedBy,
            score: Number(score.score.toFixed(3)),
            sourceName,
          };
        }
      }
    }
  }

  return bestMatch;
}

function getStringLikeField(record: UnknownRecord, field: string) {
  const value = record[field];

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getNestedStringLikeField(
  record: UnknownRecord,
  nestedField: string,
  field: string,
) {
  const nested = record[nestedField];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return undefined;
  }

  return getStringLikeField(nested as UnknownRecord, field);
}

function toFiniteNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getG2AProductId(productOffer: G2AProductOffer) {
  const record = productOffer as UnknownRecord;

  return (
    getStringLikeField(record, "productId") ??
    getStringLikeField(record, "id") ??
    getNestedStringLikeField(record, "product", "id") ??
    getNestedStringLikeField(record, "product", "productId")
  );
}

function getG2AOfferId(offer: G2AOffer | null) {
  if (!offer) {
    return undefined;
  }

  const record = offer as UnknownRecord;

  return (
    getStringLikeField(record, "id") ??
    getStringLikeField(record, "offerId") ??
    getStringLikeField(record, "sellerOfferId")
  );
}

function getDetailsStringValue(details: G2AProductDetails, field: string) {
  const record = details as UnknownRecord;

  return (
    getStringLikeField(record, field) ??
    getNestedStringLikeField(record, field, "name") ??
    getNestedStringLikeField(record, field, "title")
  );
}

function getG2ACategoryNames(details?: G2AProductDetails) {
  if (!details?.categories || !Array.isArray(details.categories)) {
    return [];
  }

  return details.categories
    .map((category) => {
      if (typeof category === "string") {
        return category.trim();
      }

      if (category && typeof category === "object") {
        const record = category as UnknownRecord;
        return (
          getStringLikeField(record, "name") ??
          getStringLikeField(record, "title") ??
          getStringLikeField(record, "slug")
        );
      }

      return undefined;
    })
    .filter((categoryName): categoryName is string => Boolean(categoryName));
}

function getGallery(details?: G2AProductDetails) {
  const images = Array.isArray(details?.images) ? details.images : [];
  const gallery = [
    getG2AProductMainImage(details ?? {}),
    ...images,
  ].filter((image): image is string => Boolean(image?.trim()));

  return Array.from(new Set(gallery));
}

function toRelationMatch(match: NameMatch<Category>): RelationMatch {
  return {
    id: match.item._id,
    name: match.item.name,
    slug: match.item.slug,
    matchedBy: match.matchedBy,
    score: match.score,
    sourceName: match.sourceName,
  };
}

function toRegionMatch(match: NameMatch<Region>): RelationMatch {
  return {
    id: match.item._id,
    name: match.item.name,
    code: match.item.code,
    matchedBy: match.matchedBy,
    score: match.score,
    sourceName: match.sourceName,
  };
}

function findCategoryMatch(
  categories: Category[],
  g2aCategoryNames: string[],
) {
  const localCategories = categories.filter((category) => !category.isPlateforme);
  return findBestNameMatch(
    localCategories,
    g2aCategoryNames,
    (category) => category.name,
  );
}

function findPlatformMatch(categories: Category[], platformNames: string[]) {
  if (platformNames.length === 0) {
    return null;
  }

  return findBestNameMatch(
    categories.filter((category) => category.isPlateforme),
    platformNames,
    (category) => category.name,
  );
}

function findRegionMatch(regions: Region[], regionName?: string) {
  const sourceNames = getRegionSourceNames(regionName);

  if (sourceNames.length === 0) {
    return null;
  }

  return findBestRegionMatch(regions, sourceNames);
}

function getLocalCurrency() {
  const currency = process.env.G2A_LOCAL_CURRENCY?.trim().toUpperCase();

  return currency && /^[A-Z]{3}$/.test(currency) ? currency : "TND";
}

function getImportActiveDefault() {
  return process.env.G2A_IMPORT_ACTIVE_BY_DEFAULT === "true";
}

function getProductTitle(details?: G2AProductDetails, productId?: string) {
  return (
    details?.name?.trim() ||
    (productId ? `Produit G2A ${productId}` : "Produit G2A")
  );
}

function getProductDescription(details?: G2AProductDetails) {
  const record = (details ?? {}) as UnknownRecord;

  return (
    getStringLikeField(record, "description") ??
    getStringLikeField(record, "shortDescription")
  );
}

function getProductSku(productId?: string) {
  return `G2A-${productId ?? "UNKNOWN"}`
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getMissingFields(input: {
  productId?: string;
  selectedOffer: G2AOffer | null;
  categoryId: string | null;
  platformId: string | null;
  regionIds: string[];
  title: string;
  sku: string;
}) {
  const missingFields: string[] = [];

  if (!input.productId) {
    missingFields.push("g2a.productId");
  }

  if (!input.selectedOffer) {
    missingFields.push("g2a.selectedOffer");
  }

  if (!input.title) {
    missingFields.push("title");
  }

  if (!input.sku || input.sku === "G2A-UNKNOWN") {
    missingFields.push("sku");
  }

  if (!input.categoryId) {
    missingFields.push("categoryId/categoryIds");
  }

  if (!input.platformId) {
    missingFields.push("platformId");
  }

  if (input.regionIds.length === 0) {
    missingFields.push("regionIds");
  }

  return missingFields;
}

export async function getG2AProductMappingContext() {
  const [categoryDocuments, regionDocuments] = await Promise.all([
    listAllActiveCategories(),
    listAllRegions(),
  ]);

  return {
    categories: serializeDocument<Category[]>(categoryDocuments),
    regions: serializeDocument<Region[]>(regionDocuments),
  };
}

export function mapG2AToLocalProductPreview(input: {
  productOffer: G2AProductOffer;
  productDetails?: G2AProductDetails;
  context: G2AProductMappingContext;
}) {
  const productId = getG2AProductId(input.productOffer);
  const selectedOffer = chooseCheapestAvailableOffer(input.productOffer.offers);
  const buyPrice = toFiniteNumber(selectedOffer?.price);
  const supplierStock = toFiniteNumber(selectedOffer?.quantity) ?? 0;
  const publicPrice = roundMoney((buyPrice ?? 0) * 4);
  const title = getProductTitle(input.productDetails, productId);
  const slugSource = input.productDetails?.slug || title;
  const categoryNames = getG2ACategoryNames(input.productDetails);
  const platformName = input.productDetails
    ? getDetailsStringValue(input.productDetails, "platform")
    : undefined;
  const platformCandidates = [
    platformName,
    ...categoryNames,
  ].filter((candidate): candidate is string => Boolean(candidate));
  const regionName = input.productDetails
    ? getDetailsStringValue(input.productDetails, "region")
    : undefined;
  const categoryMatch = findCategoryMatch(input.context.categories, categoryNames);
  const platformMatch = findPlatformMatch(
    input.context.categories,
    platformCandidates,
  );
  const regionMatch = findRegionMatch(input.context.regions, regionName);
  const region = regionMatch?.item ?? null;
  const currency = getLocalCurrency();
  const sku = getProductSku(productId);
  const category = categoryMatch?.item ?? null;
  const platform = platformMatch?.item ?? null;
  const categoryId = category?._id ?? null;
  const platformId = platform?._id ?? null;
  const regionIds = region ? [region._id] : [];
  const missingFields = getMissingFields({
    productId,
    selectedOffer,
    categoryId,
    platformId,
    regionIds,
    title,
    sku,
  });
  const now = new Date().toISOString();
  const currentProductPayload: LocalProductPreviewPayload = {
    title,
    slug: generateSlug(slugSource || sku),
    shortDescription: getProductDescription(input.productDetails),
    description: getProductDescription(input.productDetails),
    image: input.productDetails
      ? getG2AProductMainImage(input.productDetails)
      : undefined,
    gallery: getGallery(input.productDetails),
    categoryId,
    categoryIds: category ? [category._id] : [],
    platformId,
    regionId: region?._id ?? null,
    regionIds,
    faceValue: publicPrice,
    currency,
    price: publicPrice,
    discountPercent: 0,
    finalPrice: calculateDiscountedPrice(publicPrice, 0),
    sku,
    productType: "game_credit",
    deliveryMode: "manual_email",
    isFeatured: false,
    isActive: getImportActiveDefault() && supplierStock > 0,
    faqItems: [],
    seoTitle: title,
    seoDescription: getProductDescription(input.productDetails),
  };
  const g2aExtension: G2AExtensionPreview = {
    supplier: "g2a",
    stock: supplierStock,
    autoPricing: true,
    g2a: {
      productId,
      selectedOfferId: getG2AOfferId(selectedOffer),
      buyPrice,
      supplierStock,
      currency: selectedOffer?.currency,
      platform: platformName,
      region: regionName,
      developer: input.productDetails?.developer,
      publisher: input.productDetails?.publisher,
      releaseDate: input.productDetails?.releaseDate,
      lastSyncedAt: now,
      lastCatalogSyncedAt: now,
    },
  };

  return {
    canCreateWithCurrentSchema: missingFields.length === 0,
    blockingMissingFields: missingFields,
    pricingRule: {
      buyPrice,
      multiplier: 4,
      publicPrice,
      currency,
    },
    stockRule: {
      source: "selectedOffer.quantity",
      value: supplierStock,
    },
    imageRule: {
      source: currentProductPayload.image === input.productDetails?.portraitImage
        ? "portraitImage"
        : currentProductPayload.image === input.productDetails?.thumbnail
          ? "thumbnail"
          : null,
      value: currentProductPayload.image,
    },
    matchedRelations: {
      g2aCategoryNames: categoryNames,
      category: categoryMatch ? toRelationMatch(categoryMatch) : null,
      g2aPlatformCandidates: platformCandidates,
      platform: platformMatch ? toRelationMatch(platformMatch) : null,
      g2aRegion: regionName,
      g2aRegionCandidates: getRegionSourceNames(regionName),
      region: regionMatch ? toRegionMatch(regionMatch) : null,
    },
    currentProductPayload,
    g2aExtension,
    note:
      "currentProductPayload correspond aux champs du modèle Product actuel. g2aExtension montre les champs à ajouter au modèle avant l'import réel.",
  };
}

export const g2aProductMappingService = {
  getG2AProductMappingContext,
  mapG2AToLocalProductPreview,
};
