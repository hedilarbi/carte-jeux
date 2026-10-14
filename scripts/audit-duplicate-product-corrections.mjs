import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const INPUT_FILE =
  "playsdepot-csv-corrections-par-action/10-doublons-produits/10-doublons-produits-lot-01.csv";
const REPORT_DIR = "exports/seo-duplicate-product-corrections";
const HEADERS = [
  "URL produit",
  "H1 commun",
  "Title actuel",
  "Meta actuelle",
  "Nombre fiches dans groupe",
  "URL cible candidate (non validée)",
  "Statut",
  "Action",
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

function getSlug(rawUrl) {
  const url = new URL(rawUrl);
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "playsdepot.com" ||
    parts.length !== 2 ||
    parts[0] !== "produits" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`URL produit invalide : ${rawUrl}`);
  }
  return decodeURIComponent(parts[1]);
}

function uniqueCount(values) {
  return new Set(values.map((value) => JSON.stringify(value))).size;
}

function referenceMap(rows) {
  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

async function aggregateItemReferences(collection, productIds) {
  return collection
    .aggregate([
      { $unwind: "$items" },
      { $match: { "items.productId": { $in: productIds } } },
      { $group: { _id: "$items.productId", count: { $sum: 1 } } },
    ])
    .toArray();
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("La variable MONGODB_URI est obligatoire.");
  const rows = parseCsv(await readFile(INPUT_FILE, "utf8")).map((row) => ({
    ...row,
    slug: getSlug(row["URL produit"]),
    candidateSlug: getSlug(row["URL cible candidate (non validée)"]),
  }));
  const uniqueSlugs = new Set(rows.map((row) => row.slug));
  if (uniqueSlugs.size !== rows.length) throw new Error("Le CSV contient des slugs dupliqués.");

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const database = process.env.MONGODB_DB_NAME ? client.db(process.env.MONGODB_DB_NAME) : client.db();
    const products = await database.collection("products").find(
      { slug: { $in: [...uniqueSlugs] } },
      {
        projection: {
          slug: 1,
          title: 1,
          seoTitle: 1,
          seoDescription: 1,
          sku: 1,
          price: 1,
          finalPrice: 1,
          currency: 1,
          stock: 1,
          faceValue: 1,
          productType: 1,
          deliveryMode: 1,
          supplier: 1,
          platformId: 1,
          categoryIds: 1,
          regionIds: 1,
          image: 1,
          isActive: 1,
          indexable: 1,
          g2a: 1,
        },
      },
    ).toArray();
    const productsBySlug = new Map(products.map((product) => [product.slug, product]));
    const missing = rows.filter((row) => !productsBySlug.has(row.slug));
    if (missing.length > 0) throw new Error(`${missing.length} produit(s) CSV absent(s) de la base.`);

    const productIds = products.map((product) => product._id);
    const [orderRows, cartRows, favoriteRows, bestSellerRows] = await Promise.all([
      aggregateItemReferences(database.collection("orders"), productIds),
      aggregateItemReferences(database.collection("carts"), productIds),
      aggregateItemReferences(database.collection("favoritelists"), productIds),
      database.collection("bestsellers").aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: "$productId", count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    const referenceMaps = {
      orders: referenceMap(orderRows),
      carts: referenceMap(cartRows),
      favorites: referenceMap(favoriteRows),
      bestSellers: referenceMap(bestSellerRows),
    };
    const groupsByH1 = new Map();
    for (const row of rows) {
      const group = groupsByH1.get(row["H1 commun"]) ?? [];
      group.push({ row, product: productsBySlug.get(row.slug) });
      groupsByH1.set(row["H1 commun"], group);
    }

    const groups = [...groupsByH1.entries()].map(([h1, entries]) => {
      const candidateSlugs = [...new Set(entries.map(({ row }) => row.candidateSlug))];
      const records = entries.map(({ row, product }) => ({
        id: product._id.toString(),
        slug: product.slug,
        isCandidate: candidateSlugs.includes(product.slug),
        sku: product.sku,
        supplier: product.supplier,
        supplierProductId: product.g2a?.productId,
        selectedOfferId: product.g2a?.selectedOfferId,
        buyPrice: product.g2a?.buyPrice,
        supplierStock: product.g2a?.supplierStock,
        salePrice: product.finalPrice ?? product.price,
        currency: product.currency,
        platform: product.g2a?.platform,
        region: product.g2a?.region,
        developer: product.g2a?.developer,
        publisher: product.g2a?.publisher,
        releaseDate: product.g2a?.releaseDate,
        productType: product.productType,
        deliveryMode: product.deliveryMode,
        faceValue: product.faceValue,
        active: product.isActive,
        indexable: product.indexable !== false,
        references: Object.fromEntries(
          Object.entries(referenceMaps).map(([name, map]) => [name, map.get(product._id.toString()) ?? 0]),
        ),
        csvLine: row.line,
      }));
      return {
        h1,
        csvExpectedCount: Number(entries[0].row["Nombre fiches dans groupe"]),
        actualCount: entries.length,
        candidateSlugs,
        variations: {
          sku: uniqueCount(records.map((record) => record.sku)),
          supplierProductId: uniqueCount(records.map((record) => record.supplierProductId)),
          selectedOfferId: uniqueCount(records.map((record) => record.selectedOfferId)),
          buyPrice: uniqueCount(records.map((record) => record.buyPrice)),
          supplierStock: uniqueCount(records.map((record) => record.supplierStock)),
          salePrice: uniqueCount(records.map((record) => record.salePrice)),
          platform: uniqueCount(records.map((record) => record.platform)),
          region: uniqueCount(records.map((record) => record.region)),
          productType: uniqueCount(records.map((record) => record.productType)),
          deliveryMode: uniqueCount(records.map((record) => record.deliveryMode)),
          faceValue: uniqueCount(records.map((record) => record.faceValue)),
        },
        records,
      };
    });

    const report = {
      timestamp: new Date().toISOString(),
      database: database.databaseName,
      inputFile: INPUT_FILE,
      counts: {
        csvRows: rows.length,
        matchedProducts: products.length,
        groups: groups.length,
        allActive: products.filter((product) => product.isActive).length,
        allIndexable: products.filter((product) => product.indexable !== false).length,
        groupsWithUniqueSupplierProductIds: groups.filter(
          (group) => group.variations.supplierProductId === group.actualCount,
        ).length,
        groupsWithDifferentSalePrices: groups.filter((group) => group.variations.salePrice > 1).length,
        groupsReferencedByOrders: groups.filter((group) =>
          group.records.some((record) => record.references.orders > 0),
        ).length,
        productsReferencedByOrders: groups.flatMap((group) => group.records).filter(
          (record) => record.references.orders > 0,
        ).length,
      },
      decision:
        "Aucune fusion, désactivation, canonique ni redirection automatique : le CSV exige un arbitrage, et chaque fiche possède un SKU ainsi qu’un identifiant produit fournisseur distincts.",
      groups,
    };
    await mkdir(REPORT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const reportPath = path.join(REPORT_DIR, `${timestamp}-audit-report.json`);
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ counts: report.counts, decision: report.decision, reportPath }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
