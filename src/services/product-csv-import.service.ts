import type { z } from "zod";

import { productCreateSchema } from "@/lib/validation/product";
import { parseCsv } from "@/lib/utils/csv";
import { serializeDocument } from "@/lib/utils/serialization";
import { listCategories } from "@/repositories/category.repository";
import { existsProductSku } from "@/repositories/product.repository";
import { listAllRegions } from "@/repositories/region.repository";
import type { Category, Product, Region } from "@/types/entities";

import { productService } from "./product.service";

const MAX_CSV_ROWS = 200;

const REQUIRED_HEADERS = [
  "title",
  "sku",
  "category_slugs",
  "platform_slug",
  "region_codes",
  "face_value",
  "currency",
  "price",
  "product_type",
];

export interface ProductCsvImportError {
  line: number;
  message: string;
}

export interface ProductCsvImportResult {
  createdCount: number;
  errors: ProductCsvImportError[];
  products: Product[];
}

interface PreparedProduct {
  line: number;
  payload: z.infer<typeof productCreateSchema>;
}

type RowRecord = Record<string, string>;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function getValue(record: RowRecord, field: string) {
  return record[field]?.trim() ?? "";
}

function getList(value: string) {
  return Array.from(
    new Set(
      value
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parseNumber(value: string, field: string, errors: string[]) {
  if (!value) {
    errors.push(`La colonne « ${field} » est obligatoire.`);
    return Number.NaN;
  }

  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    errors.push(`La colonne « ${field} » doit contenir un nombre valide.`);
  }

  return numberValue;
}

function parseBoolean(
  value: string,
  field: string,
  defaultValue: boolean,
  errors: string[],
) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "oui"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "non"].includes(normalized)) {
    return false;
  }

  errors.push(
    `La colonne « ${field} » accepte uniquement true/false, oui/non ou 1/0.`,
  );
  return defaultValue;
}

function addError(
  errors: ProductCsvImportError[],
  line: number,
  message: string,
) {
  errors.push({ line, message });
}

function getRowRecord(headers: string[], values: string[]) {
  return Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? ""]),
  );
}

function getCategoryIds(
  slugs: string[],
  categoryMap: Map<string, Category>,
  errors: string[],
) {
  if (slugs.length === 0) {
    errors.push("La colonne « category_slugs » doit contenir au moins un slug.");
    return [];
  }

  const categoryIds: string[] = [];
  const unknownSlugs: string[] = [];

  slugs.forEach((slug) => {
    const category = categoryMap.get(normalizeSlug(slug));

    if (category) {
      categoryIds.push(category._id);
    } else {
      unknownSlugs.push(slug);
    }
  });

  if (unknownSlugs.length > 0) {
    errors.push(
      `Type de produit introuvable ou inactif : ${unknownSlugs.join(", ")}.`,
    );
  }

  return categoryIds;
}

function getPlatformId(
  value: string,
  platformMap: Map<string, Category>,
  errors: string[],
) {
  if (!value) {
    errors.push("La colonne « platform_slug » est obligatoire.");
    return "";
  }

  const platform = platformMap.get(normalizeSlug(value));

  if (!platform) {
    errors.push(`Plateforme introuvable ou inactive : ${value}.`);
    return "";
  }

  return platform._id;
}

function getRegionIds(
  codes: string[],
  regionMap: Map<string, Region>,
  errors: string[],
) {
  if (codes.length === 0) {
    errors.push("La colonne « region_codes » doit contenir au moins un code.");
    return [];
  }

  const regionIds: string[] = [];
  const unknownCodes: string[] = [];

  codes.forEach((code) => {
    const region = regionMap.get(code.trim().toUpperCase());

    if (region) {
      regionIds.push(region._id);
    } else {
      unknownCodes.push(code);
    }
  });

  if (unknownCodes.length > 0) {
    errors.push(
      `Région introuvable ou inactive : ${unknownCodes.join(", ")}.`,
    );
  }

  return regionIds;
}

async function validateSkuAvailability(
  products: PreparedProduct[],
  errors: ProductCsvImportError[],
) {
  const skuLines = new Map<string, number>();

  products.forEach((product) => {
    const sku = product.payload.sku.toUpperCase();
    const firstLine = skuLines.get(sku);

    if (firstLine) {
      addError(
        errors,
        product.line,
        `Le SKU « ${sku} » est déjà utilisé à la ligne ${firstLine} du fichier.`,
      );
      return;
    }

    skuLines.set(sku, product.line);
  });

  const availability = await Promise.all(
    products.map(async (product) => ({
      line: product.line,
      sku: product.payload.sku.toUpperCase(),
      exists: await existsProductSku(product.payload.sku.toUpperCase()),
    })),
  );

  availability.forEach((item) => {
    if (item.exists) {
      addError(errors, item.line, `Le SKU « ${item.sku} » existe déjà.`);
    }
  });
}

export const productCsvImportService = {
  async import(text: string): Promise<ProductCsvImportResult> {
    let parsedCsv: ReturnType<typeof parseCsv>;

    try {
      parsedCsv = parseCsv(text);
    } catch (error) {
      return {
        createdCount: 0,
        errors: [
          {
            line: 1,
            message:
              error instanceof Error
                ? error.message
                : "Le fichier CSV est invalide.",
          },
        ],
        products: [],
      };
    }

    const { headers: rawHeaders, rows } = parsedCsv;
    const headers = rawHeaders.map(normalizeHeader);
    const errors: ProductCsvImportError[] = [];
    const duplicateHeaders = headers.filter(
      (header, index) => headers.indexOf(header) !== index,
    );
    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header),
    );

    if (duplicateHeaders.length > 0) {
      addError(
        errors,
        1,
        `Colonnes dupliquées : ${Array.from(new Set(duplicateHeaders)).join(", ")}.`,
      );
    }

    if (missingHeaders.length > 0) {
      addError(
        errors,
        1,
        `Colonnes obligatoires manquantes : ${missingHeaders.join(", ")}.`,
      );
    }

    if (rows.length === 0) {
      addError(errors, 1, "Le fichier ne contient aucune ligne de produit.");
    }

    if (rows.length > MAX_CSV_ROWS) {
      addError(
        errors,
        1,
        `Le fichier ne peut pas contenir plus de ${MAX_CSV_ROWS} produits.`,
      );
    }

    if (errors.length > 0) {
      return { createdCount: 0, errors, products: [] };
    }

    const [categoryResult, regionRecords] = await Promise.all([
      listCategories({ page: 1, limit: 100, isActive: true }),
      listAllRegions(),
    ]);
    const categories = serializeDocument<Category[]>(categoryResult.items);
    const regions = serializeDocument<Region[]>(regionRecords);
    const categoryMap = new Map(
      categories
        .filter((category) => !category.isPlateforme)
        .map((category) => [normalizeSlug(category.slug), category]),
    );
    const platformMap = new Map(
      categories
        .filter((category) => category.isPlateforme)
        .map((category) => [normalizeSlug(category.slug), category]),
    );
    const regionMap = new Map(
      regions.map((region) => [region.code.toUpperCase(), region]),
    );
    const preparedProducts: PreparedProduct[] = [];

    rows.forEach((row) => {
      if (
        row.values.length > headers.length &&
        row.values.slice(headers.length).some((value) => value.trim())
      ) {
        addError(
          errors,
          row.line,
          "La ligne contient plus de colonnes que l’en-tête.",
        );
        return;
      }

      const record = getRowRecord(headers, row.values);
      const rowErrors: string[] = [];
      const categoryIds = getCategoryIds(
        getList(getValue(record, "category_slugs")),
        categoryMap,
        rowErrors,
      );
      const platformId = getPlatformId(
        getValue(record, "platform_slug"),
        platformMap,
        rowErrors,
      );
      const regionIds = getRegionIds(
        getList(getValue(record, "region_codes")),
        regionMap,
        rowErrors,
      );
      const payload = {
        title: getValue(record, "title"),
        slug: getValue(record, "slug"),
        shortDescription: getValue(record, "short_description"),
        description: getValue(record, "description"),
        image: getValue(record, "image"),
        gallery: getList(getValue(record, "gallery")),
        categoryIds,
        platformId,
        regionIds,
        faceValue: parseNumber(
          getValue(record, "face_value"),
          "face_value",
          rowErrors,
        ),
        currency: getValue(record, "currency"),
        price: parseNumber(getValue(record, "price"), "price", rowErrors),
        discountPercent: getValue(record, "discount_percent")
          ? parseNumber(
              getValue(record, "discount_percent"),
              "discount_percent",
              rowErrors,
            )
          : 0,
        sku: getValue(record, "sku"),
        productType: getValue(record, "product_type"),
        isFeatured: parseBoolean(
          getValue(record, "is_featured"),
          "is_featured",
          false,
          rowErrors,
        ),
        isActive: parseBoolean(
          getValue(record, "is_active"),
          "is_active",
          true,
          rowErrors,
        ),
        seoTitle: getValue(record, "seo_title"),
        seoDescription: getValue(record, "seo_description"),
      };

      if (rowErrors.length > 0) {
        rowErrors.forEach((message) => addError(errors, row.line, message));
        return;
      }

      const parsed = productCreateSchema.safeParse(payload);

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          addError(errors, row.line, issue.message);
        });
        return;
      }

      preparedProducts.push({ line: row.line, payload: parsed.data });
    });

    if (errors.length > 0) {
      return { createdCount: 0, errors, products: [] };
    }

    await validateSkuAvailability(preparedProducts, errors);

    if (errors.length > 0) {
      return { createdCount: 0, errors, products: [] };
    }

    const products: Product[] = [];

    for (const product of preparedProducts) {
      products.push(
        await productService.create(
          product.payload as z.input<typeof productCreateSchema>,
        ),
      );
    }

    return {
      createdCount: products.length,
      errors: [],
      products,
    };
  },
};
