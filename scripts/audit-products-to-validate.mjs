import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const inputDirectory = path.resolve(
  "playsdepot-csv-corrections-par-action/12-produits-a-valider",
);
const outputDirectory = path.resolve("exports/seo-products-to-validate");

function parseCsv(content) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ";" && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function getSlug(value) {
  if (!value?.trim()) return "";
  const pathname = value.startsWith("http") ? new URL(value).pathname : value;
  return pathname.replace(/^\/+|\/+$/g, "").split("/").at(-1) ?? "";
}

function increment(record, key) {
  record[key] = (record[key] ?? 0) + 1;
}

function normalizeTokens(value) {
  return new Set(
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3),
  );
}

function tokenSimilarity(left, right) {
  const leftTokens = normalizeTokens(left);
  const rightTokens = normalizeTokens(right);
  const union = new Set([...leftTokens, ...rightTokens]);
  if (!union.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token));
  return intersection.length / union.size;
}

if (!process.env.MONGODB_URI) {
  throw new Error("La variable MONGODB_URI est obligatoire.");
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith(".csv"))
  .sort();
const csvRows = [];

for (const file of files) {
  const content = (await readFile(path.join(inputDirectory, file), "utf8")).replace(
    /^\uFEFF/,
    "",
  );
  const [header, ...rows] = parseCsv(content);

  if (header.length !== 6 || rows.some((row) => row.length !== header.length)) {
    throw new Error(`Structure CSV invalide dans ${file}.`);
  }

  for (const [index, row] of rows.entries()) {
    const record = Object.fromEntries(
      header.map((column, columnIndex) => [column, row[columnIndex]]),
    );
    csvRows.push({
      line: index + 2,
      currentUrl: record["URL actuelle"],
      currentSlug: getSlug(record["URL actuelle"]),
      productLabel: record["Produit / page"],
      priority: record.Priorité,
      validation: record["Validation avant publication"],
      proposedUrl: record["URL proposée dans étude précédente"],
      proposedSlug: getSlug(record["URL proposée dans étude précédente"]),
      proposedKeyword: record["Mot-clé principal proposé"],
    });
  }
}

const currentSlugs = [...new Set(csvRows.map((row) => row.currentSlug).filter(Boolean))];
const proposedSlugs = [...new Set(csvRows.map((row) => row.proposedSlug).filter(Boolean))];
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

try {
  const database = process.env.MONGODB_DB_NAME
    ? client.db(process.env.MONGODB_DB_NAME)
    : client.db();
  const products = database.collection("products");
  const [currentProducts, proposedProducts] = await Promise.all([
    products
      .find(
        { slug: { $in: currentSlugs } },
        {
          projection: {
            slug: 1,
            title: 1,
            sku: 1,
            isActive: 1,
            indexable: 1,
            "g2a.productId": 1,
          },
        },
      )
      .toArray(),
    products
      .find(
        { slug: { $in: proposedSlugs } },
        {
          projection: {
            slug: 1,
            title: 1,
            sku: 1,
            isActive: 1,
            indexable: 1,
            "g2a.productId": 1,
          },
        },
      )
      .toArray(),
  ]);
  const currentBySlug = new Map(
    currentProducts.map((product) => [product.slug, product]),
  );
  const proposedBySlug = new Map(
    proposedProducts.map((product) => [product.slug, product]),
  );
  const priorityCounts = {};
  const validationCounts = {};
  const proposedSlugCounts = {};

  for (const row of csvRows) {
    increment(priorityCounts, row.priority || "vide");
    increment(validationCounts, row.validation || "vide");
    increment(proposedSlugCounts, row.proposedSlug || "vide");
  }

  const rows = csvRows.map((row) => {
    const currentProduct = currentBySlug.get(row.currentSlug);
    const proposedProduct = proposedBySlug.get(row.proposedSlug);
    const labelKeywordSimilarity = tokenSimilarity(
      row.productLabel,
      row.proposedKeyword,
    );
    const currentProposedSimilarity = tokenSimilarity(
      currentProduct?.title ?? row.productLabel,
      proposedProduct?.title ?? row.proposedKeyword,
    );

    return {
      ...row,
      currentProduct: currentProduct
        ? {
            id: currentProduct._id.toString(),
            title: currentProduct.title,
            sku: currentProduct.sku,
            supplierProductId: currentProduct.g2a?.productId,
            active: currentProduct.isActive,
            indexable: currentProduct.indexable !== false,
          }
        : null,
      proposedProduct: proposedProduct
        ? {
            id: proposedProduct._id.toString(),
            title: proposedProduct.title,
            sku: proposedProduct.sku,
            supplierProductId: proposedProduct.g2a?.productId,
            active: proposedProduct.isActive,
            indexable: proposedProduct.indexable !== false,
          }
        : null,
      similarities: {
        labelToProposedKeyword: Number(labelKeywordSimilarity.toFixed(3)),
        currentToProposedProduct: Number(currentProposedSimilarity.toFixed(3)),
      },
    };
  });
  const duplicatedProposedTargets = Object.entries(proposedSlugCounts)
    .filter(([slug, count]) => slug !== "vide" && count > 1)
    .map(([slug, count]) => ({ slug, count }))
    .sort((left, right) => right.count - left.count || left.slug.localeCompare(right.slug));
  const report = {
    timestamp: new Date().toISOString(),
    database: database.databaseName,
    inputFiles: files,
    counts: {
      csvRows: csvRows.length,
      uniqueCurrentSlugs: currentSlugs.length,
      matchedCurrentProducts: currentProducts.length,
      missingCurrentProducts: currentSlugs.length - currentProducts.length,
      activeCurrentProducts: currentProducts.filter((product) => product.isActive).length,
      indexableCurrentProducts: currentProducts.filter(
        (product) => product.indexable !== false,
      ).length,
      uniqueProposedSlugs: proposedSlugs.length,
      proposedTargetsExistingInDatabase: proposedProducts.length,
      duplicatedProposedTargets: duplicatedProposedTargets.length,
      rowsWithLowKeywordSimilarity: rows.filter(
        (row) => row.similarities.labelToProposedKeyword < 0.25,
      ).length,
      rowsWithVeryLowKeywordSimilarity: rows.filter(
        (row) => row.similarities.labelToProposedKeyword < 0.1,
      ).length,
    },
    priorityCounts,
    validationCounts,
    duplicatedProposedTargets,
    decision:
      "Aucune modification, redirection ou fusion automatique : toutes les lignes exigent une validation avant publication et les propositions ne constituent pas une table de correspondance fiable.",
    rows,
  };

  await mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(
    outputDirectory,
    `${new Date().toISOString().replaceAll(":", "-")}-audit-report.json`,
  );
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        counts: report.counts,
        priorityCounts,
        distinctValidationInstructions: Object.keys(validationCounts).length,
        decision: report.decision,
        outputPath,
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
}
