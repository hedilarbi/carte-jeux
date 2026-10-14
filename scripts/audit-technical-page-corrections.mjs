import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const INPUT_DIR =
  "playsdepot-csv-corrections-par-action/09-corrections-techniques-pages";
const REPORT_DIR = "exports/seo-technical-page-corrections";
const HEADERS = [
  "URL actuelle",
  "Produit / page",
  "Priorité",
  "Validation avant publication",
  "Statut HTTP crawl",
  "Anomalies",
  "Actions page",
];

function parseCsv(input) {
  const rows = [];
  let values = [];
  let value = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;

  function commitRow() {
    values.push(value);
    if (values.some((cell) => cell.trim())) rows.push({ line: rowLine, values });
    values = [];
    value = "";
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (inQuotes && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && character === ";") {
      values.push(value);
      value = "";
      continue;
    }
    if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      if (inQuotes) value += "\n";
      else {
        commitRow();
        rowLine = line + 1;
      }
      line += 1;
      continue;
    }
    value += character;
  }

  if (inQuotes) throw new Error(`Guillemet non fermé à partir de la ligne ${rowLine}.`);
  if (value || values.length > 0) commitRow();
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.values.map((header) => header.replace(/^\uFEFF/, "").trim());
  if (JSON.stringify(headers) !== JSON.stringify(HEADERS)) {
    throw new Error(`En-têtes inattendus : ${JSON.stringify(headers)}`);
  }
  return dataRows.map((row) => {
    if (row.values.length !== HEADERS.length) {
      throw new Error(`Ligne ${row.line} : ${row.values.length} colonnes au lieu de ${HEADERS.length}.`);
    }
    return {
      line: row.line,
      ...Object.fromEntries(HEADERS.map((header, index) => [header, row.values[index].trim()])),
    };
  });
}

function classifyUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.hostname !== "playsdepot.com" || url.hash) {
    return { type: "invalid" };
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "produits" && !url.search) {
    return { type: "product", slug: decodeURIComponent(parts[1]) };
  }
  if (url.pathname === "/produits" && [...url.searchParams.keys()].every((key) => key === "page")) {
    const page = url.searchParams.get("page");
    return /^\d+$/.test(page ?? "") && Number(page) > 0
      ? { type: "listing", page: Number(page) }
      : { type: "invalid" };
  }
  return { type: "other" };
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function distribution(map) {
  return Object.fromEntries(
    [...map.entries()].sort((left, right) => right[1] - left[1]),
  );
}

function duplicateValueMap(products, key) {
  const counts = new Map();
  for (const product of products) {
    const value = product[key]?.trim();
    if (product.isActive && value) increment(counts, value);
  }
  return counts;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("La variable MONGODB_URI est obligatoire.");
  const files = (await readdir(INPUT_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
    .map((entry) => entry.name)
    .sort();
  const rows = [];
  for (const file of files) {
    for (const row of parseCsv(await readFile(path.join(INPUT_DIR, file), "utf8"))) {
      rows.push({ ...row, file, classification: classifyUrl(row["URL actuelle"]) });
    }
  }

  const productRows = rows.filter((row) => row.classification.type === "product");
  const listingRows = rows.filter((row) => row.classification.type === "listing");
  const otherRows = rows.filter(
    (row) => !["product", "listing"].includes(row.classification.type),
  );
  const uniqueProductRows = new Map();
  const duplicateProductSlugs = [];
  for (const row of productRows) {
    const previous = uniqueProductRows.get(row.classification.slug);
    if (previous) duplicateProductSlugs.push({ slug: row.classification.slug, first: previous, duplicate: row });
    else uniqueProductRows.set(row.classification.slug, row);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const database = process.env.MONGODB_DB_NAME ? client.db(process.env.MONGODB_DB_NAME) : client.db();
    const productCollection = database.collection("products");
    const products = await productCollection.find(
      {},
      { projection: { slug: 1, title: 1, seoTitle: 1, seoDescription: 1, description: 1, isActive: 1, indexable: 1 } },
    ).toArray();
    const faqPresence = await productCollection.find(
      { slug: { $in: [...uniqueProductRows.keys()] } },
      { projection: { slug: 1, faqItems: { $slice: 1 } } },
    ).toArray();
    const productsWithFaq = new Set(
      faqPresence
        .filter((product) => Array.isArray(product.faqItems) && product.faqItems.length > 0)
        .map((product) => product.slug),
    );
    const productsBySlug = new Map(products.map((product) => [product.slug, product]));
    const seoTitleCounts = duplicateValueMap(products, "seoTitle");
    const seoDescriptionCounts = duplicateValueMap(products, "seoDescription");
    const matched = [...uniqueProductRows.values()]
      .filter((row) => productsBySlug.has(row.classification.slug))
      .map((row) => ({ row, product: productsBySlug.get(row.classification.slug) }));
    const missing = [...uniqueProductRows.values()].filter(
      (row) => !productsBySlug.has(row.classification.slug),
    );
    const titleMismatches = matched.filter(({ row, product }) => product.title !== row["Produit / page"]);
    const duplicateSeoTitles = matched.filter(
      ({ product }) => product.seoTitle && (seoTitleCounts.get(product.seoTitle.trim()) ?? 0) > 1,
    );
    const duplicateSeoDescriptions = matched.filter(
      ({ product }) => product.seoDescription && (seoDescriptionCounts.get(product.seoDescription.trim()) ?? 0) > 1,
    );
    const anomalies = new Map();
    const actions = new Map();
    const statuses = new Map();
    rows.forEach((row) => {
      increment(anomalies, row.Anomalies);
      increment(actions, row["Actions page"]);
      increment(statuses, row["Statut HTTP crawl"]);
    });
    const listingPages = listingRows.map((row) => row.classification.page);
    const report = {
      timestamp: new Date().toISOString(),
      database: database.databaseName,
      inputDirectory: INPUT_DIR,
      files,
      counts: {
        csvRows: rows.length,
        productRows: productRows.length,
        uniqueProductSlugs: uniqueProductRows.size,
        duplicateProductSlugs: duplicateProductSlugs.length,
        matchedProducts: matched.length,
        missingProducts: missing.length,
        activeProducts: matched.filter(({ product }) => product.isActive).length,
        indexableProducts: matched.filter(({ product }) => product.indexable !== false).length,
        titleMismatches: titleMismatches.length,
        missingSeoTitles: matched.filter(({ product }) => !product.seoTitle?.trim()).length,
        duplicateSeoTitles: duplicateSeoTitles.length,
        missingSeoDescriptions: matched.filter(({ product }) => !product.seoDescription?.trim()).length,
        duplicateSeoDescriptions: duplicateSeoDescriptions.length,
        missingLongDescriptions: matched.filter(({ product }) => !product.description?.trim()).length,
        productsWithFaq: matched.filter(({ row }) => productsWithFaq.has(row.classification.slug)).length,
        productsWithoutFaq: matched.filter(({ row }) => !productsWithFaq.has(row.classification.slug)).length,
        listingRows: listingRows.length,
        uniqueListingPages: new Set(listingPages).size,
        minimumListingPage: Math.min(...listingPages),
        maximumListingPage: Math.max(...listingPages),
        otherRows: otherRows.length,
      },
      distributions: {
        statuses: distribution(statuses),
        anomalies: distribution(anomalies),
        actions: distribution(actions),
      },
      missingProducts: missing.map((row) => ({ file: row.file, line: row.line, slug: row.classification.slug })),
      titleMismatches: titleMismatches.map(({ row, product }) => ({ file: row.file, line: row.line, slug: row.classification.slug, csvTitle: row["Produit / page"], databaseTitle: product.title })),
      duplicateSeoTitleSamples: duplicateSeoTitles.slice(0, 100).map(({ row, product }) => ({ slug: row.classification.slug, seoTitle: product.seoTitle, activeOccurrences: seoTitleCounts.get(product.seoTitle.trim()) })),
      duplicateSeoDescriptionSamples: duplicateSeoDescriptions.slice(0, 100).map(({ row, product }) => ({ slug: row.classification.slug, activeOccurrences: seoDescriptionCounts.get(product.seoDescription.trim()) })),
      otherRows: otherRows.map((row) => ({ file: row.file, line: row.line, url: row["URL actuelle"], type: row.classification.type })),
    };
    await mkdir(REPORT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const reportPath = path.join(REPORT_DIR, `${timestamp}-audit-report.json`);
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ counts: report.counts, distributions: report.distributions, reportPath }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
