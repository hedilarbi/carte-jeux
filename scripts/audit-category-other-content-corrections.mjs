import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const inputDirectory = path.resolve(
  "playsdepot-csv-corrections-par-action/13-contenus-categories-autres",
);
const outputDirectory = path.resolve("exports/seo-category-other-content-corrections");

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

function increment(record, key) {
  record[key] = (record[key] ?? 0) + 1;
}

function parseUrl(value) {
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  return {
    pathname: url.pathname,
    slug: parts.at(-1) ?? "",
    isCategory: parts[0] === "categories" && parts.length === 3,
    isPlateforme: parts[1] === "plateformes",
    isProduct: parts[0] === "produits" && parts.length === 2,
    page: Number(url.searchParams.get("page") ?? 1),
  };
}

if (!process.env.MONGODB_URI) {
  throw new Error("La variable MONGODB_URI est obligatoire.");
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith(".csv"))
  .sort();
const rows = [];

for (const file of files) {
  const content = (await readFile(path.join(inputDirectory, file), "utf8")).replace(
    /^\uFEFF/,
    "",
  );
  const [header, ...fileRows] = parseCsv(content);

  if (header.length !== 8 || fileRows.some((row) => row.length !== header.length)) {
    throw new Error(`Structure CSV invalide dans ${file}.`);
  }

  for (const [index, row] of fileRows.entries()) {
    const record = Object.fromEntries(
      header.map((column, columnIndex) => [column, row[columnIndex]]),
    );
    rows.push({
      line: index + 2,
      url: record["URL actuelle"],
      label: record["Produit / page"],
      priority: record.Priorité,
      validation: record["Validation avant publication"],
      pageType: record["Type de page"],
      suggestedH2: record["H2 conseillé"],
      suggestedH3: record["H3 conseillé"],
      instruction: record["Contenu / structure à produire"],
      parsedUrl: parseUrl(record["URL actuelle"]),
    });
  }
}

const categoryRows = rows.filter((row) => row.pageType === "Catégorie");
const productRows = rows.filter((row) => row.pageType === "Produit");
const categoryKeys = new Set(
  categoryRows.map(
    (row) => `${row.parsedUrl.isPlateforme ? "platform" : "type"}:${row.parsedUrl.slug}`,
  ),
);
const productSlugs = [...new Set(productRows.map((row) => row.parsedUrl.slug))];
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

try {
  const database = process.env.MONGODB_DB_NAME
    ? client.db(process.env.MONGODB_DB_NAME)
    : client.db();
  const [categories, products] = await Promise.all([
    database
      .collection("categories")
      .find(
        {
          $or: [...categoryKeys].map((key) => {
            const [kind, slug] = key.split(":");
            return { slug, isPlateforme: kind === "platform" };
          }),
        },
        {
          projection: {
            slug: 1,
            name: 1,
            isPlateforme: 1,
            isActive: 1,
            indexable: 1,
            intro: 1,
            sections: 1,
            faq: 1,
          },
        },
      )
      .toArray(),
    database
      .collection("products")
      .find(
        { slug: { $in: productSlugs } },
        { projection: { slug: 1, title: 1, isActive: 1, indexable: 1 } },
      )
      .toArray(),
  ]);
  const pageTypeCounts = {};
  const priorityCounts = {};
  const validationCounts = {};

  for (const row of rows) {
    increment(pageTypeCounts, row.pageType);
    increment(priorityCounts, row.priority || "vide");
    increment(validationCounts, row.validation || "vide");
  }

  const matchedCategoryKeys = new Set(
    categories.map(
      (category) =>
        `${category.isPlateforme ? "platform" : "type"}:${category.slug}`,
    ),
  );
  const report = {
    timestamp: new Date().toISOString(),
    database: database.databaseName,
    inputFiles: files,
    counts: {
      csvRows: rows.length,
      categoryRows: categoryRows.length,
      uniqueCategories: categoryKeys.size,
      matchedCategories: categories.length,
      missingCategories: [...categoryKeys].filter(
        (key) => !matchedCategoryKeys.has(key),
      ).length,
      activeCategories: categories.filter((category) => category.isActive).length,
      categoriesWithIntro: categories.filter((category) => category.intro?.trim()).length,
      categoriesWithSections: categories.filter(
        (category) => Array.isArray(category.sections) && category.sections.length > 0,
      ).length,
      categoriesWithFaq: categories.filter(
        (category) => Array.isArray(category.faq) && category.faq.length > 0,
      ).length,
      productRows: productRows.length,
      matchedProducts: products.length,
      activeProducts: products.filter((product) => product.isActive).length,
      indexableProducts: products.filter((product) => product.indexable !== false).length,
      rowsRequiringValidation: rows.filter((row) => row.validation !== "Aucune").length,
      paginatedRows: rows.filter((row) => row.parsedUrl.page > 1).length,
    },
    pageTypeCounts,
    priorityCounts,
    validationCounts,
    missingCategories: categoryRows
      .filter(
        (row) =>
          !matchedCategoryKeys.has(
            `${row.parsedUrl.isPlateforme ? "platform" : "type"}:${row.parsedUrl.slug}`,
          ),
      )
      .map((row) => ({ line: row.line, url: row.url, validation: row.validation })),
    validationRows: rows
      .filter((row) => row.validation !== "Aucune")
      .map((row) => ({
        line: row.line,
        url: row.url,
        label: row.label,
        priority: row.priority,
        validation: row.validation,
        pageType: row.pageType,
      })),
    decision: {
      categories:
        "Afficher une introduction et une structure H2/H3 factuelles de repli lorsque la catégorie ne possède pas de contenu éditorial enregistré.",
      pagination:
        "Ne pas recopier les introductions sur les pages suivantes ; conserver les liens HTML de pagination déjà en place.",
      validationRows:
        "Ne déployer aucune fusion, canonique ou redirection pour les lignes soumises à validation commerciale.",
    },
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
        pageTypeCounts,
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
