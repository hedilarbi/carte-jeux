import { generateSlug } from "@/lib/utils/slug";
import { serializeDocument } from "@/lib/utils/serialization";
import type { CategoryRecord } from "@/models/category.model";
import {
  createCategories,
  getNextCategorySortOrder,
  listAllCategories,
} from "@/repositories/category.repository";
import {
  fetchG2AProductDetails,
  fetchG2AProductOffers,
  type G2AProductDetails,
  type G2AProductOffer,
} from "@/services/g2a-export.service";
import type { Category } from "@/types/entities";

const DEFAULT_ITEMS_PER_PAGE = 100;

type TaxonomyKind = "category" | "platform";
type UnknownRecord = Record<string, unknown>;

interface SyncG2ATaxonomiesInput {
  page?: number;
  itemsPerPage?: number;
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizePage(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;
}

function normalizeItemsPerPage(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0
    ? Math.floor(value)
    : DEFAULT_ITEMS_PER_PAGE;
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

function getG2AProductId(productOffer: G2AProductOffer) {
  const record = productOffer as UnknownRecord;

  return (
    getStringLikeField(record, "productId") ??
    getStringLikeField(record, "id") ??
    getNestedStringLikeField(record, "product", "id") ??
    getNestedStringLikeField(record, "product", "productId")
  );
}

function getResponseItems<T>(response: { data?: T[]; items?: T[] } | null) {
  return response?.data ?? response?.items ?? [];
}

function getG2ACategoryName(category: unknown) {
  if (typeof category === "string") {
    return category.trim() || undefined;
  }

  if (category && typeof category === "object" && !Array.isArray(category)) {
    const record = category as UnknownRecord;
    return (
      getStringLikeField(record, "name") ??
      getStringLikeField(record, "title") ??
      getStringLikeField(record, "slug")
    );
  }

  return undefined;
}

function getG2ACategoryNames(details: G2AProductDetails) {
  if (!Array.isArray(details.categories)) {
    return [];
  }

  return details.categories
    .map(getG2ACategoryName)
    .filter((name): name is string => Boolean(name));
}

function getG2APlatformName(details: G2AProductDetails) {
  const record = details as UnknownRecord;

  return (
    getStringLikeField(record, "platform") ??
    getNestedStringLikeField(record, "platform", "name") ??
    getNestedStringLikeField(record, "platform", "title")
  );
}

function getUniqueNames(names: string[]) {
  const namesByKey = new Map<string, string>();

  names.forEach((name) => {
    const trimmedName = name.trim();
    const key = normalizeName(trimmedName);

    if (trimmedName && key && !namesByKey.has(key)) {
      namesByKey.set(key, trimmedName);
    }
  });

  return Array.from(namesByKey.values()).sort((left, right) =>
    left.localeCompare(right),
  );
}

function getKindKey(kind: TaxonomyKind, name: string) {
  return `${kind}:${normalizeName(name)}`;
}

function getCategoryKind(category: Pick<CategoryRecord, "isPlateforme">) {
  return category.isPlateforme ? "platform" : "category";
}

function resolveUniqueSlug(
  name: string,
  kind: TaxonomyKind,
  existingSlugs: Set<string>,
) {
  const baseSlug = generateSlug(name) || `g2a-${kind}`;
  const kindSlug = generateSlug(`${name}-${kind}`) || `g2a-${kind}`;
  let candidate = existingSlugs.has(baseSlug) ? kindSlug : baseSlug;
  let suffix = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${kindSlug}-${suffix}`;
    suffix += 1;
  }

  existingSlugs.add(candidate);
  return candidate;
}

function toCategoryDto(category: Category) {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    isPlateforme: category.isPlateforme,
  };
}

async function createMissingTaxonomies(input: {
  names: string[];
  kind: TaxonomyKind;
  existingCategories: Array<CategoryRecord & { _id: unknown }>;
  existingSlugs: Set<string>;
  existingKindNames: Set<string>;
  nextSortOrder: { value: number };
}) {
  const payloads: Partial<CategoryRecord>[] = [];
  const existingNames: string[] = [];
  const skippedNames: string[] = [];

  input.names.forEach((name) => {
    const kindKey = getKindKey(input.kind, name);

    if (!normalizeName(name)) {
      skippedNames.push(name);
      return;
    }

    if (input.existingKindNames.has(kindKey)) {
      existingNames.push(name);
      return;
    }

    input.existingKindNames.add(kindKey);
    payloads.push({
      name,
      slug: resolveUniqueSlug(name, input.kind, input.existingSlugs),
      isPlateforme: input.kind === "platform",
      isActive: true,
      sortOrder: input.nextSortOrder.value,
    });
    input.nextSortOrder.value += 1;
  });

  const created = serializeDocument<Category[]>(await createCategories(payloads));

  created.forEach((category) => {
    input.existingCategories.push(category as unknown as CategoryRecord & {
      _id: unknown;
    });
  });

  return {
    created: created.map(toCategoryDto),
    existing: existingNames,
    skipped: skippedNames,
  };
}

async function syncFromProductDetails(productDetails: G2AProductDetails[]) {
  const detectedCategories = getUniqueNames(
    productDetails.flatMap(getG2ACategoryNames),
  );
  const detectedPlatforms = getUniqueNames(
    productDetails
      .map(getG2APlatformName)
      .filter((name): name is string => Boolean(name)),
  );
  const existingCategories = serializeDocument<
    Array<CategoryRecord & { _id: unknown }>
  >(await listAllCategories());
  const existingSlugs = new Set(
    existingCategories.map((category) => category.slug),
  );
  const existingKindNames = new Set(
    existingCategories.map((category) =>
      getKindKey(getCategoryKind(category), category.name),
    ),
  );
  const nextSortOrder = {
    value: await getNextCategorySortOrder(),
  };
  const platforms = await createMissingTaxonomies({
    names: detectedPlatforms,
    kind: "platform",
    existingCategories,
    existingSlugs,
    existingKindNames,
    nextSortOrder,
  });
  const categories = await createMissingTaxonomies({
    names: detectedCategories,
    kind: "category",
    existingCategories,
    existingSlugs,
    existingKindNames,
    nextSortOrder,
  });

  return {
    detected: {
      categories: detectedCategories,
      platforms: detectedPlatforms,
    },
    created: {
      categories: categories.created,
      platforms: platforms.created,
    },
    existing: {
      categories: categories.existing,
      platforms: platforms.existing,
    },
    skipped: {
      categories: categories.skipped,
      platforms: platforms.skipped,
    },
  };
}

export const g2aTaxonomyService = {
  syncFromProductDetails,

  async syncFromProductPage(input: SyncG2ATaxonomiesInput = {}) {
    const page = normalizePage(input.page);
    const itemsPerPage = normalizeItemsPerPage(input.itemsPerPage);
    const offersResponse = await fetchG2AProductOffers(page, itemsPerPage);
    const productOffers = getResponseItems(offersResponse);
    const productIds = productOffers
      .map(getG2AProductId)
      .filter((productId): productId is string => Boolean(productId));
    const productDetails = await fetchG2AProductDetails(productIds);
    const taxonomySync = await syncFromProductDetails(productDetails);

    return {
      page,
      itemsPerPage,
      scanned: {
        productOffers: productOffers.length,
        productIds: productIds.length,
        productDetails: productDetails.length,
      },
      ...taxonomySync,
    };
  },
};
