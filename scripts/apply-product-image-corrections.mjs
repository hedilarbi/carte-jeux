import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const inputDirectory = path.resolve(
  "playsdepot-csv-corrections-par-action/11-ressources-erreurs",
);
const outputDirectory = path.resolve("exports/seo-resource-error-corrections");
const apply = process.argv.includes("--apply");
const fallbackImage = "/jeu1.jpg";

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

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`La variable ${name} est obligatoire.`);
  return value;
}

async function getBrokenSources() {
  const files = (await readdir(inputDirectory))
    .filter((file) => file.endsWith(".csv"))
    .sort();
  const sources = new Set();

  for (const file of files) {
    const content = (await readFile(path.join(inputDirectory, file), "utf8")).replace(
      /^\uFEFF/,
      "",
    );
    const [header, ...rows] = parseCsv(content);
    const statusIndex = header.indexOf("Statut HTTP crawl");
    const sourceIndex = header.indexOf("Source image encodée");

    for (const row of rows) {
      if (row[statusIndex] === "404 Not Found" && row[sourceIndex]) {
        sources.add(row[sourceIndex]);
      }
    }
  }

  return sources;
}

async function fetchSupplierDetails(productIds) {
  if (!productIds.length) return [];

  const apiUrl = getRequiredEnvironmentVariable("G2A_API_URL").replace(/\/+$/, "");
  const tokenResponse = await fetch(`${apiUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getRequiredEnvironmentVariable("G2A_CLIENT_ID"),
      client_secret: getRequiredEnvironmentVariable("G2A_CLIENT_SECRET"),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Authentification G2A refusée (${tokenResponse.status}).`);
  }

  const tokenPayload = await tokenResponse.json();
  const parameters = new URLSearchParams();
  productIds.forEach((productId) => parameters.append("productIds[]", productId));
  const response = await fetch(`${apiUrl}/export/v1/products?${parameters}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Catalogue G2A indisponible (${response.status}).`);
  }

  const payload = await response.json();
  return payload.data ?? payload.items ?? [];
}

async function isReachableImage(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function selectReplacement(details, brokenSources) {
  const candidates = [
    details?.portraitImage,
    details?.thumbnail,
    ...(Array.isArray(details?.images) ? details.images : []),
  ].filter((candidate) => {
    if (typeof candidate !== "string" || brokenSources.has(candidate)) return false;
    try {
      return new URL(candidate).hostname === "images.g2a.com";
    } catch {
      return false;
    }
  });

  for (const candidate of new Set(candidates)) {
    if (await isReachableImage(candidate)) return candidate;
  }

  return fallbackImage;
}

const brokenSources = await getBrokenSources();
const mongoClient = new MongoClient(getRequiredEnvironmentVariable("MONGODB_URI"));
await mongoClient.connect();

try {
  const database = process.env.MONGODB_DB_NAME
    ? mongoClient.db(process.env.MONGODB_DB_NAME)
    : mongoClient.db();
  const productsCollection = database.collection("products");
  const products = await productsCollection
    .find(
      {
        $or: [
          { image: { $in: [...brokenSources] } },
          { gallery: { $in: [...brokenSources] } },
        ],
      },
      {
        projection: {
          slug: 1,
          title: 1,
          image: 1,
          gallery: 1,
          isActive: 1,
          indexable: 1,
          "g2a.productId": 1,
          updatedAt: 1,
        },
      },
    )
    .toArray();
  const productsWithBrokenMainImage = products.filter((product) =>
    brokenSources.has(product.image),
  );
  const supplierDetails = await fetchSupplierDetails(
    productsWithBrokenMainImage
      .map((product) => product.g2a?.productId)
      .filter(Boolean),
  );
  const detailsByProductId = new Map(
    supplierDetails.map((details) => [String(details.productId ?? details.id), details]),
  );
  const corrections = [];

  for (const product of products) {
    const replacement = brokenSources.has(product.image)
      ? await selectReplacement(
          detailsByProductId.get(String(product.g2a?.productId)),
          brokenSources,
        )
      : product.image;
    const gallery = [
      replacement,
      ...(Array.isArray(product.gallery) ? product.gallery : []),
    ].filter(
      (image, index, images) =>
        image && !brokenSources.has(image) && images.indexOf(image) === index,
    );

    corrections.push({
      _id: product._id,
      slug: product.slug,
      oldImage: product.image,
      newImage: replacement,
      oldGallery: product.gallery ?? [],
      newGallery: gallery,
      removedBrokenGalleryImages: (product.gallery ?? []).filter((image) =>
        brokenSources.has(image),
      ).length,
      usedFallback: replacement === fallbackImage,
      updatedAt: product.updatedAt,
    });
  }

  await mkdir(outputDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const backupPath = path.join(outputDirectory, `${timestamp}-before-apply-backup.json`);
  const reportPath = path.join(
    outputDirectory,
    `${timestamp}-${apply ? "apply" : "dry-run"}-report.json`,
  );
  await writeFile(
    backupPath,
    `${JSON.stringify(
      corrections.map((correction) => ({
        _id: correction._id,
        slug: correction.slug,
        image: correction.oldImage,
        gallery: correction.oldGallery,
        updatedAt: correction.updatedAt,
      })),
      null,
      2,
    )}\n`,
  );

  let writeResult = null;
  if (apply && corrections.length) {
    writeResult = await productsCollection.bulkWrite(
      corrections.map((correction) => ({
        updateOne: {
          filter: {
            _id: correction._id,
            image: correction.oldImage,
            gallery: correction.oldGallery,
          },
          update: {
            $set: {
              image: correction.newImage,
              gallery: correction.newGallery,
              updatedAt: new Date(),
            },
          },
        },
      })),
      { ordered: false },
    );
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    database: database.databaseName,
    counts: {
      csv404Sources: brokenSources.size,
      affectedProducts: corrections.length,
      brokenMainImages: productsWithBrokenMainImage.length,
      supplierDetails: supplierDetails.length,
      fallbackImages: corrections.filter((correction) => correction.usedFallback).length,
      removedBrokenGalleryImages: corrections.reduce(
        (total, correction) => total + correction.removedBrokenGalleryImages,
        0,
      ),
      matched: writeResult?.matchedCount ?? 0,
      modified: writeResult?.modifiedCount ?? 0,
    },
    backupPath,
    corrections: corrections.map(({ _id, oldGallery, newGallery, ...correction }) => ({
      ...correction,
      productId: _id.toString(),
      oldGalleryCount: oldGallery.length,
      newGalleryCount: newGallery.length,
    })),
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report.counts, backupPath, reportPath }, null, 2));
} finally {
  await mongoClient.close();
}
