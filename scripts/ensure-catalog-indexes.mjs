import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { MongoClient } from "mongodb";

// Mongoose `autoIndex` is disabled in production, so the indexes declared in
// src/models/product.model.ts must be created explicitly. `createIndex` is
// idempotent and MongoDB builds indexes without blocking reads/writes.
// Only the indexes public pages (and therefore crawlers) depend on.
const INDEXES = [
  {
    // Product page lookup (`getProductBySlug`): without it, every product page
    // view scans the whole collection.
    key: { slug: 1 },
    name: "slug_1",
    options: { unique: true },
  },
  {
    // Category listings filter with an `$or` on platformId / categoryIds /
    // categoryId: every branch must be indexed or the whole `$or` scans.
    key: { platformId: 1 },
    name: "platformId_1",
  },
  {
    key: { isActive: 1, isFeatured: -1, createdAt: -1, _id: -1 },
    name: "catalog_popular_sort",
  },
  {
    key: { isActive: 1, _id: 1, indexable: 1, slug: 1, updatedAt: 1 },
    name: "sitemap_products_covered",
  },
];

function parseEnvFile(contents) {
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

async function loadLocalEnv() {
  try {
    parseEnvFile(await readFile(resolve(".env.local"), "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

await loadLocalEnv();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("La variable MONGODB_URI est obligatoire.");
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();

  const database = process.env.MONGODB_DB_NAME
    ? client.db(process.env.MONGODB_DB_NAME)
    : client.db();
  const products = database.collection("products");

  for (const index of INDEXES) {
    const startedAt = Date.now();

    try {
      await products.createIndex(index.key, { ...index.options, name: index.name });
      console.log(`Index ${index.name} pret (${Date.now() - startedAt} ms).`);
    } catch (error) {
      process.exitCode = 1;
      console.error(`Index ${index.name} en echec : ${error.message}`);
    }
  }
} finally {
  await client.close();
}
