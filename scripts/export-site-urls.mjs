import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { once } from "node:events";

import { MongoClient } from "mongodb";

const DEFAULT_SITE_URL = "https://playsdepot.com";
const DEFAULT_OUTPUT_PATH = "exports/site-urls.csv";
const STATIC_PATHS = [
  "/",
  "/produits",
  "/categories",
  "/precommande-gta-vi",
  "/precommande-fc27",
  "/cgv",
  "/obtenir-votre-produit",
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
    await parseEnvFile(await readFile(resolve(".env.local"), "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

function getArgument(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return argument?.slice(prefix.length);
}

function escapeCsvCell(value) {
  const serialized = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${serialized.replaceAll('"', '""')}"`;
}

function createCsvRow(values) {
  return `${values.map(escapeCsvCell).join(";")}\r\n`;
}

async function writeChunk(stream, chunk) {
  if (!stream.write(chunk)) {
    await once(stream, "drain");
  }
}

async function finishStream(stream) {
  stream.end();
  await once(stream, "finish");
}

function normalizeSiteUrl(value) {
  const url = new URL(value || DEFAULT_SITE_URL);
  return url.toString().replace(/\/$/, "");
}

await loadLocalEnv();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("La variable MONGODB_URI est obligatoire.");
}

const outputPath = resolve(getArgument("output") || DEFAULT_OUTPUT_PATH);
const temporaryPath = `${outputPath}.tmp`;
const siteUrl = normalizeSiteUrl(
  getArgument("site-url") || process.env.SITEMAP_SITE_URL || DEFAULT_SITE_URL,
);
const client = new MongoClient(mongoUri);
let exportedCount = 0;

await mkdir(dirname(outputPath), { recursive: true });

try {
  await client.connect();

  const database = process.env.MONGODB_DB_NAME
    ? client.db(process.env.MONGODB_DB_NAME)
    : client.db();
  const output = createWriteStream(temporaryPath, { encoding: "utf8" });

  output.on("error", (error) => {
    throw error;
  });

  await writeChunk(
    output,
    `\uFEFF${createCsvRow(["URL", "Type", "Derniere modification"])}`,
  );

  for (const path of STATIC_PATHS) {
    await writeChunk(output, createCsvRow([`${siteUrl}${path}`, "page", ""]));
    exportedCount += 1;
  }

  const categories = database
    .collection("categories")
    .find(
      { isActive: true, indexable: true, slug: { $type: "string", $ne: "" } },
      { projection: { _id: 0, slug: 1, isPlateforme: 1, updatedAt: 1 } },
    )
    .sort({ _id: 1 });

  for await (const category of categories) {
    const family = category.isPlateforme ? "plateformes" : "types";
    await writeChunk(
      output,
      createCsvRow([
        `${siteUrl}/categories/${family}/${encodeURIComponent(category.slug)}`,
        "categorie",
        category.updatedAt,
      ]),
    );
    exportedCount += 1;
  }

  const products = database
    .collection("products")
    .find(
      {
        isActive: true,
        indexable: { $ne: false },
        slug: { $type: "string", $ne: "" },
      },
      { projection: { _id: 0, slug: 1, updatedAt: 1 } },
    )
    .sort({ _id: 1 })
    .batchSize(1_000);

  for await (const product of products) {
    await writeChunk(
      output,
      createCsvRow([
        `${siteUrl}/produits/${encodeURIComponent(product.slug)}`,
        "produit",
        product.updatedAt,
      ]),
    );
    exportedCount += 1;

    if (exportedCount % 10_000 === 0) {
      console.log(`${exportedCount.toLocaleString("fr-FR")} URLs exportees...`);
    }
  }

  await finishStream(output);
  await rename(temporaryPath, outputPath);

  console.log(
    `${exportedCount.toLocaleString("fr-FR")} URLs exportees dans ${outputPath}`,
  );
} catch (error) {
  await unlink(temporaryPath).catch(() => undefined);
  throw error;
} finally {
  await client.close();
}
