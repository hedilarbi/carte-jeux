import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const INPUT_FILE =
  "playsdepot-csv-corrections-par-action/07-url-canoniques-indexation/07-url-canoniques-indexation-lot-01.csv";
const REPORT_DIR = "exports/seo-url-canonical-indexation-corrections";
const HEADERS = [
  "URL actuelle",
  "Produit / page",
  "Priorité",
  "Validation avant publication",
  "HTTP crawl",
  "URL cible conseillée",
  "Décision URL",
  "301 à créer",
  "Canonique actuelle",
  "Canonique cible",
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

function pathAndSearch(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.hostname !== "playsdepot.com" || url.hash) {
    throw new Error(`URL inattendue : ${rawUrl}`);
  }
  return `${url.pathname}${url.search}`;
}

function productSlug(rawUrl) {
  const url = new URL(rawUrl);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "produits" && !url.search
    ? decodeURIComponent(parts[1])
    : null;
}

function ids(values) {
  return [...new Set(values.map((value) => value.toString()))].sort();
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("La variable MONGODB_URI est obligatoire.");
  const rows = parseCsv(await readFile(INPUT_FILE, "utf8"));
  rows.forEach((row) => {
    pathAndSearch(row["URL actuelle"]);
    pathAndSearch(row["URL cible conseillée"]);
    pathAndSearch(row["Canonique cible"]);
  });

  const productRows = rows.filter((row) => productSlug(row["URL actuelle"]));
  const redirectRows = rows.filter((row) => row["301 à créer"] === "Proposition 301");
  const otherRows = rows.filter(
    (row) => !productSlug(row["URL actuelle"]) && row["301 à créer"] !== "Proposition 301",
  );
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = process.env.MONGODB_DB_NAME ? client.db(process.env.MONGODB_DB_NAME) : client.db();
    const products = database.collection("products");
    const categories = database.collection("categories");
    const slugs = productRows.map((row) => productSlug(row["URL actuelle"]));
    const matchedProducts = await products
      .find({ slug: { $in: slugs } }, { projection: { slug: 1, title: 1, indexable: 1, isActive: 1 } })
      .toArray();
    const productsBySlug = new Map(matchedProducts.map((product) => [product.slug, product]));

    const categoryPairs = [
      ["mobile-ios-android", false, "jeu-mobile", true],
      ["amazon-category", false, "amazon", true],
      ["netflix-category", false, "netflix", true],
      ["adidas-category", false, "adidas", true],
      ["binance-category", false, "binance", true],
    ];
    const categoryDocuments = await categories
      .find(
        { slug: { $in: [...new Set(categoryPairs.flatMap(([source, , target]) => [source, target]))] } },
        { projection: { slug: 1, name: 1, isPlateforme: 1, isActive: 1, indexable: 1, canonical: 1 } },
      )
      .toArray();
    const categoryByKey = new Map(
      categoryDocuments.map((category) => [`${category.slug}:${Boolean(category.isPlateforme)}`, category]),
    );
    const categoryComparisons = [];

    for (const [sourceSlug, sourcePlatform, targetSlug, targetPlatform] of categoryPairs) {
      const source = categoryByKey.get(`${sourceSlug}:${sourcePlatform}`);
      const target = categoryByKey.get(`${targetSlug}:${targetPlatform}`);
      const sourceIds = source
        ? ids((await products.find({ isActive: true, categoryIds: source._id }, { projection: { _id: 1 } }).toArray()).map((item) => item._id))
        : [];
      const targetIds = target
        ? ids((await products.find({ isActive: true, $or: [{ platformId: target._id }, { categoryIds: target._id }] }, { projection: { _id: 1 } }).toArray()).map((item) => item._id))
        : [];
      const sourceSet = new Set(sourceIds);
      const targetSet = new Set(targetIds);
      categoryComparisons.push({
        sourceSlug,
        source: source ? { ...source, _id: source._id.toString() } : null,
        targetSlug,
        target: target ? { ...target, _id: target._id.toString() } : null,
        sourceProductCount: sourceIds.length,
        targetProductCount: targetIds.length,
        sourceOnlyCount: sourceIds.filter((id) => !targetSet.has(id)).length,
        targetOnlyCount: targetIds.filter((id) => !sourceSet.has(id)).length,
        exactSameActiveProducts:
          sourceIds.length === targetIds.length && sourceIds.every((id) => targetSet.has(id)),
      });
    }

    const missingProducts = productRows.filter(
      (row) => !productsBySlug.has(productSlug(row["URL actuelle"])),
    );
    const titleMismatches = productRows.filter((row) => {
      const product = productsBySlug.get(productSlug(row["URL actuelle"]));
      return product && product.title !== row["Produit / page"];
    });
    const nonSelfCanonicalProducts = productRows.filter(
      (row) => row["URL actuelle"] !== row["Canonique cible"],
    );
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const report = {
      timestamp: new Date().toISOString(),
      database: database.databaseName,
      inputFile: INPUT_FILE,
      counts: {
        csvRows: rows.length,
        productRows: productRows.length,
        matchedProducts: productRows.length - missingProducts.length,
        missingProducts: missingProducts.length,
        productTitleMismatches: titleMismatches.length,
        activeProducts: productRows.filter((row) => productsBySlug.get(productSlug(row["URL actuelle"]))?.isActive).length,
        indexableProducts: productRows.filter((row) => productsBySlug.get(productSlug(row["URL actuelle"]))?.indexable).length,
        nonSelfCanonicalProducts: nonSelfCanonicalProducts.length,
        redirectProposalRows: redirectRows.length,
        otherRows: otherRows.length,
      },
      missingProducts: missingProducts.map((row) => ({ line: row.line, url: row["URL actuelle"] })),
      titleMismatches: titleMismatches.map((row) => ({
        line: row.line,
        slug: productSlug(row["URL actuelle"]),
        csvTitle: row["Produit / page"],
        databaseTitle: productsBySlug.get(productSlug(row["URL actuelle"]))?.title,
      })),
      categoryComparisons,
      redirects: redirectRows.map((row) => ({
        line: row.line,
        source: pathAndSearch(row["URL actuelle"]),
        destination: pathAndSearch(row["URL cible conseillée"]),
      })),
      otherCanonicalTargets: otherRows.map((row) => ({
        line: row.line,
        current: pathAndSearch(row["URL actuelle"]),
        canonical: pathAndSearch(row["Canonique cible"]),
      })),
    };
    await mkdir(REPORT_DIR, { recursive: true });
    const reportPath = path.join(REPORT_DIR, `${timestamp}-audit-report.json`);
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ counts: report.counts, categoryComparisons, reportPath }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
