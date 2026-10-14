import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const INPUT_DIR = "playsdepot-csv-corrections-par-action/02-meta-descriptions";
const REPORT_DIR = "exports/seo-meta-description-corrections";
const HEADERS = [
  "URL actuelle",
  "Produit / page",
  "Priorité",
  "Validation avant publication",
  "Valeur actuelle",
  "Valeur cible",
];
const READ_BATCH_SIZE = 5_000;
const WRITE_BATCH_SIZE = 500;

function parseArguments(argumentsList) {
  const unknown = argumentsList.filter((argument) => argument !== "--apply");

  if (unknown.length > 0) {
    throw new Error(`Argument inconnu : ${unknown[0]}`);
  }

  return { apply: argumentsList.includes("--apply") };
}

function parseCsv(input) {
  const rows = [];
  let values = [];
  let value = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;

  function commitRow() {
    values.push(value);

    if (values.some((cell) => cell.trim())) {
      rows.push({ line: rowLine, values });
    }

    values = [];
    value = "";
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (inQuotes && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ";") {
      values.push(value);
      value = "";
      continue;
    }

    if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") {
        index += 1;
      }

      if (inQuotes) {
        value += "\n";
      } else {
        commitRow();
        rowLine = line + 1;
      }

      line += 1;
      continue;
    }

    value += character;
  }

  if (inQuotes) {
    throw new Error(`Guillemet non fermé à partir de la ligne ${rowLine}.`);
  }

  if (value || values.length > 0) {
    commitRow();
  }

  if (rows.length === 0) {
    throw new Error("Le fichier CSV est vide.");
  }

  const [headerRow, ...dataRows] = rows;

  return {
    headers: headerRow.values.map((header) =>
      header.replace(/^\uFEFF/, "").trim(),
    ),
    rows: dataRows,
  };
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function getProductSlug(rawUrl) {
  const url = new URL(rawUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (url.protocol !== "https:" || url.hostname !== "playsdepot.com") {
    throw new Error(`Domaine ou protocole inattendu : ${rawUrl}`);
  }

  if (
    pathParts.length === 2 &&
    pathParts[0] === "produits" &&
    !url.search &&
    !url.hash
  ) {
    return decodeURIComponent(pathParts[1]);
  }

  return null;
}

function chunks(values, size) {
  const result = [];

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  return result;
}

async function loadCorrections() {
  const fileNames = (await readdir(INPUT_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new Error(`Aucun fichier CSV trouvé dans ${INPUT_DIR}.`);
  }

  const corrections = [];
  const skipped = [];
  const issues = [];
  let totalRows = 0;

  for (const fileName of fileNames) {
    const parsed = parseCsv(await readFile(path.join(INPUT_DIR, fileName), "utf8"));

    if (!arraysEqual(parsed.headers, HEADERS)) {
      issues.push({
        type: "invalid_headers",
        file: fileName,
        expected: HEADERS,
        actual: parsed.headers,
      });
      continue;
    }

    for (const row of parsed.rows) {
      totalRows += 1;

      if (row.values.length !== HEADERS.length) {
        issues.push({
          type: "invalid_column_count",
          file: fileName,
          line: row.line,
          expected: HEADERS.length,
          actual: row.values.length,
        });
        continue;
      }

      const record = Object.fromEntries(
        HEADERS.map((header, index) => [header, row.values[index].trim()]),
      );

      try {
        const slug = getProductSlug(record["URL actuelle"]);

        if (!slug) {
          skipped.push({
            file: fileName,
            line: row.line,
            url: record["URL actuelle"],
          });
          continue;
        }

        const desiredSeoDescription = record["Valeur cible"];

        if (!desiredSeoDescription) {
          throw new Error("La valeur cible est vide.");
        }

        if (desiredSeoDescription.length > 320) {
          throw new Error(
            `La valeur cible dépasse 320 caractères (${desiredSeoDescription.length}).`,
          );
        }

        corrections.push({
          file: fileName,
          line: row.line,
          slug,
          productPage: record["Produit / page"],
          priority: record["Priorité"],
          validation: record["Validation avant publication"],
          currentRenderedDescription: record["Valeur actuelle"],
          desiredSeoDescription,
        });
      } catch (error) {
        issues.push({
          type: "invalid_row",
          file: fileName,
          line: row.line,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const uniqueBySlug = new Map();

  for (const correction of corrections) {
    const previous = uniqueBySlug.get(correction.slug);

    if (previous) {
      issues.push({
        type:
          previous.desiredSeoDescription === correction.desiredSeoDescription
            ? "duplicate_slug"
            : "conflicting_duplicate_slug",
        slug: correction.slug,
        first: { file: previous.file, line: previous.line },
        duplicate: { file: correction.file, line: correction.line },
      });
      continue;
    }

    uniqueBySlug.set(correction.slug, correction);
  }

  return {
    fileNames,
    corrections: [...uniqueBySlug.values()],
    issues,
    skipped,
    totalRows,
    productRows: corrections.length,
  };
}

async function loadProducts(collection, slugs) {
  const products = new Map();

  for (const slugBatch of chunks(slugs, READ_BATCH_SIZE)) {
    const documents = await collection
      .find(
        { slug: { $in: slugBatch } },
        {
          projection: {
            slug: 1,
            title: 1,
            seoDescription: 1,
            description: 1,
            shortDescription: 1,
            updatedAt: 1,
          },
        },
      )
      .toArray();

    for (const document of documents) {
      products.set(document.slug, document);
    }
  }

  return products;
}

function getRenderedDescription(product) {
  return (
    product.seoDescription ||
    product.description ||
    product.shortDescription ||
    `Achetez ${product.title} en Tunisie.`
  );
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function buildOptimisticFilter(product) {
  if (typeof product.seoDescription === "string") {
    return { _id: product._id, seoDescription: product.seoDescription };
  }

  return {
    _id: product._id,
    $or: [{ seoDescription: { $exists: false } }, { seoDescription: null }],
  };
}

function summarizeByFile(rows) {
  const summary = {};

  for (const row of rows) {
    const current = summary[row.file] ?? {
      rows: 0,
      alreadyApplied: 0,
      pending: 0,
      sourceMismatch: 0,
      titleMismatch: 0,
    };

    current.rows += 1;
    current.alreadyApplied += Number(row.alreadyApplied);
    current.pending += Number(!row.alreadyApplied);
    current.sourceMismatch += Number(!row.alreadyApplied && !row.sourceMatches);
    current.titleMismatch += Number(!row.titleMatches);
    summary[row.file] = current;
  }

  return summary;
}

async function writeJson(filePath, value) {
  await writeFile(
    filePath,
    `${JSON.stringify(
      value,
      (_key, item) => (item instanceof Date ? item.toISOString() : item),
      2,
    )}\n`,
    "utf8",
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const loaded = await loadCorrections();
  const fatalCsvIssues = loaded.issues.filter(
    (issue) => issue.type !== "duplicate_slug",
  );

  if (fatalCsvIssues.length > 0) {
    throw new Error(
      `Audit CSV bloqué par ${fatalCsvIssues.length} anomalie(s). Première anomalie : ${JSON.stringify(fatalCsvIssues[0])}`,
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("La variable MONGODB_URI est obligatoire.");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  await mkdir(REPORT_DIR, { recursive: true });

  try {
    await client.connect();
    const database = process.env.MONGODB_DB_NAME
      ? client.db(process.env.MONGODB_DB_NAME)
      : client.db();
    const collection = database.collection("products");
    const products = await loadProducts(
      collection,
      loaded.corrections.map((correction) => correction.slug),
    );
    const missing = loaded.corrections.filter(
      (correction) => !products.has(correction.slug),
    );
    const audited = loaded.corrections
      .filter((correction) => products.has(correction.slug))
      .map((correction) => {
        const product = products.get(correction.slug);
        const renderedDescription = getRenderedDescription(product);

        return {
          ...correction,
          productId: product._id.toString(),
          databaseTitle: product.title,
          databaseSeoDescription: product.seoDescription ?? null,
          databaseUpdatedAt: product.updatedAt ?? null,
          renderedDescription,
          titleMatches: product.title === correction.productPage,
          sourceMatches:
            !correction.currentRenderedDescription ||
            normalizeWhitespace(renderedDescription) ===
              normalizeWhitespace(correction.currentRenderedDescription),
          alreadyApplied:
            product.seoDescription === correction.desiredSeoDescription,
        };
      });
    const pending = audited.filter((row) => !row.alreadyApplied);
    const titleMismatches = audited.filter((row) => !row.titleMatches);
    const sourceMismatches = pending.filter((row) => !row.sourceMatches);
    const report = {
      mode: options.apply ? "apply" : "dry-run",
      timestamp: new Date().toISOString(),
      database: database.databaseName,
      inputDirectory: INPUT_DIR,
      files: loaded.fileNames,
      counts: {
        csvRows: loaded.totalRows,
        productRows: loaded.productRows,
        skippedNonProductRows: loaded.skipped.length,
        uniqueSlugs: loaded.corrections.length,
        duplicateSlugs: loaded.issues.filter(
          (issue) => issue.type === "duplicate_slug",
        ).length,
        matchedProducts: audited.length,
        missingProducts: missing.length,
        titleMismatches: titleMismatches.length,
        sourceMismatches: sourceMismatches.length,
        alreadyApplied: audited.length - pending.length,
        pending: pending.length,
      },
      byFile: summarizeByFile(audited),
      missing: missing.map(({ file, line, slug }) => ({ file, line, slug })),
      titleMismatches: titleMismatches.map((row) => ({
        file: row.file,
        line: row.line,
        slug: row.slug,
        csvProductPage: row.productPage,
        databaseTitle: row.databaseTitle,
      })),
      sourceMismatches: sourceMismatches.map((row) => ({
        file: row.file,
        line: row.line,
        slug: row.slug,
        csvCurrent: row.currentRenderedDescription,
        databaseRendered: row.renderedDescription,
      })),
    };
    const reportPath = path.join(
      REPORT_DIR,
      `${timestamp}-${report.mode}-report.json`,
    );

    if (!options.apply) {
      await writeJson(reportPath, report);
      console.log(
        JSON.stringify(
          {
            mode: report.mode,
            database: report.database,
            counts: report.counts,
            byFile: report.byFile,
            reportPath,
          },
          null,
          2,
        ),
      );
      return;
    }

    if (sourceMismatches.length > 0) {
      await writeJson(reportPath, report);
      throw new Error(
        `Écriture bloquée : ${sourceMismatches.length} valeur(s) actuelle(s) divergente(s). Rapport : ${reportPath}`,
      );
    }

    const backupPath = path.join(
      REPORT_DIR,
      `${timestamp}-before-apply-backup.json`,
    );
    await writeJson(
      backupPath,
      pending.map((row) => ({
        _id: row.productId,
        slug: row.slug,
        title: row.databaseTitle,
        seoDescription: row.databaseSeoDescription,
        updatedAt: row.databaseUpdatedAt,
      })),
    );

    let matchedCount = 0;
    let modifiedCount = 0;
    const applyStartedAt = new Date();

    for (const rowBatch of chunks(pending, WRITE_BATCH_SIZE)) {
      const operations = rowBatch.map((row) => {
        const product = products.get(row.slug);

        return {
          updateOne: {
            filter: buildOptimisticFilter(product),
            update: {
              $set: {
                seoDescription: row.desiredSeoDescription,
                updatedAt: applyStartedAt,
              },
            },
          },
        };
      });
      const result = await collection.bulkWrite(operations, { ordered: true });
      matchedCount += result.matchedCount;
      modifiedCount += result.modifiedCount;

      if (result.matchedCount !== operations.length) {
        throw new Error(
          `Conflit concurrent détecté : ${result.matchedCount}/${operations.length} opérations correspondent encore à l'état audité.`,
        );
      }
    }

    report.applied = {
      requested: pending.length,
      matched: matchedCount,
      modified: modifiedCount,
      updatedAt: applyStartedAt,
      backupPath,
    };
    await writeJson(reportPath, report);
    console.log(
      JSON.stringify(
        {
          mode: report.mode,
          database: report.database,
          counts: report.counts,
          applied: report.applied,
          reportPath,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
