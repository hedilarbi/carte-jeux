import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { MongoClient } from "mongodb";

const TITLE_SUFFIX = " | PlayDepot";
const DEFAULT_INPUT_DIR =
  "playsdepot-csv-corrections-par-action/01-titles";
const DEFAULT_REPORT_DIR = "exports/seo-title-corrections";
const EXPECTED_HEADERS = [
  "URL actuelle",
  "Produit / page",
  "Priorité",
  "Validation avant publication",
  "Valeur actuelle",
  "Valeur cible",
];
const READ_BATCH_SIZE = 1_000;
const WRITE_BATCH_SIZE = 500;

function parseArguments(argv) {
  const options = {
    apply: false,
    inputDir: DEFAULT_INPUT_DIR,
    reportDir: DEFAULT_REPORT_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--apply") {
      options.apply = true;
      continue;
    }

    if (argument === "--input-dir" || argument === "--report-dir") {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`Une valeur est requise après ${argument}.`);
      }

      if (argument === "--input-dir") {
        options.inputDir = value;
      } else {
        options.reportDir = value;
      }

      index += 1;
      continue;
    }

    throw new Error(`Argument inconnu : ${argument}`);
  }

  return options;
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
  const headers = headerRow.values.map((header) =>
    header.replace(/^\uFEFF/, "").trim(),
  );

  return { headers, rows: dataRows };
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function getSlug(rawUrl) {
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

function getStoredSeoTitle(renderedTitle) {
  return renderedTitle.endsWith(TITLE_SUFFIX)
    ? renderedTitle.slice(0, -TITLE_SUFFIX.length).trim()
    : renderedTitle.trim();
}

function chunks(values, size) {
  const result = [];

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  return result;
}

function jsonValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
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

async function loadCorrections(inputDir) {
  const directory = await import("node:fs/promises").then(({ readdir }) =>
    readdir(inputDir, { withFileTypes: true }),
  );
  const fileNames = directory
    .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new Error(`Aucun fichier CSV trouvé dans ${inputDir}.`);
  }

  const corrections = [];
  const skipped = [];
  const issues = [];
  let totalRows = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(inputDir, fileName);
    const parsed = parseCsv(await readFile(filePath, "utf8"));

    if (!arraysEqual(parsed.headers, EXPECTED_HEADERS)) {
      issues.push({
        type: "invalid_headers",
        file: fileName,
        expected: EXPECTED_HEADERS,
        actual: parsed.headers,
      });
      continue;
    }

    for (const row of parsed.rows) {
      totalRows += 1;

      if (row.values.length !== EXPECTED_HEADERS.length) {
        issues.push({
          type: "invalid_column_count",
          file: fileName,
          line: row.line,
          expected: EXPECTED_HEADERS.length,
          actual: row.values.length,
        });
        continue;
      }

      const record = Object.fromEntries(
        EXPECTED_HEADERS.map((header, index) => [
          header,
          row.values[index].trim(),
        ]),
      );

      try {
        const slug = getSlug(record["URL actuelle"]);

        if (!slug) {
          skipped.push({
            file: fileName,
            line: row.line,
            url: record["URL actuelle"],
          });
          continue;
        }

        const desiredSeoTitle = getStoredSeoTitle(record["Valeur cible"]);

        if (!desiredSeoTitle) {
          throw new Error("La valeur cible est vide après retrait du suffixe.");
        }

        if (desiredSeoTitle.length > 160) {
          throw new Error(
            `La valeur à stocker dépasse 160 caractères (${desiredSeoTitle.length}).`,
          );
        }

        corrections.push({
          file: fileName,
          line: row.line,
          slug,
          productPage: record["Produit / page"],
          priority: record["Priorité"],
          validation: record["Validation avant publication"],
          currentRenderedTitle: record["Valeur actuelle"],
          desiredRenderedTitle: record["Valeur cible"],
          desiredSeoTitle,
          targetHadSiteSuffix: record["Valeur cible"].endsWith(TITLE_SUFFIX),
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
          previous.desiredSeoTitle === correction.desiredSeoTitle
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
    skipped,
    issues,
    rawRowCount: corrections.length,
    totalRows,
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
            seoTitle: 1,
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

function currentRenderedTitle(product) {
  const pageTitle = product.seoTitle || `${product.title} | PlaySDepot`;
  return `${pageTitle}${TITLE_SUFFIX}`;
}

function buildOptimisticFilter(product) {
  if (typeof product.seoTitle === "string") {
    return { _id: product._id, seoTitle: product.seoTitle };
  }

  return {
    _id: product._id,
    $or: [{ seoTitle: { $exists: false } }, { seoTitle: null }],
  };
}

async function writeJson(filePath, value) {
  await writeFile(
    filePath,
    `${JSON.stringify(value, (_key, item) => jsonValue(item), 2)}\n`,
    "utf8",
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const loaded = await loadCorrections(options.inputDir);
  const fatalCsvIssues = loaded.issues.filter(
    (issue) => issue.type !== "duplicate_slug",
  );

  if (fatalCsvIssues.length > 0) {
    throw new Error(
      `Audit CSV bloqué par ${fatalCsvIssues.length} anomalie(s). Première anomalie : ${JSON.stringify(fatalCsvIssues[0])}`,
    );
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("La variable MONGODB_URI est obligatoire.");
  }

  const client = new MongoClient(mongoUri);
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  await mkdir(options.reportDir, { recursive: true });

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
        const renderedTitle = currentRenderedTitle(product);

        return {
          ...correction,
          productId: product._id.toString(),
          databaseTitle: product.title,
          databaseSeoTitle: product.seoTitle ?? null,
          databaseUpdatedAt: product.updatedAt ?? null,
          renderedTitle,
          titleMatches: product.title === correction.productPage,
          sourceMatches:
            !correction.currentRenderedTitle ||
            renderedTitle === correction.currentRenderedTitle,
          alreadyApplied: product.seoTitle === correction.desiredSeoTitle,
        };
      });
    const titleMismatches = audited.filter((row) => !row.titleMatches);
    const pending = audited.filter((row) => !row.alreadyApplied);
    const sourceMismatches = pending.filter((row) => !row.sourceMatches);
    const report = {
      mode: options.apply ? "apply" : "dry-run",
      timestamp: new Date().toISOString(),
      database: database.databaseName,
      inputDirectory: options.inputDir,
      files: loaded.fileNames,
      counts: {
        csvRows: loaded.totalRows,
        productRows: loaded.rawRowCount,
        skippedNonProductRows: loaded.skipped.length,
        uniqueSlugs: loaded.corrections.length,
        duplicateSlugs: loaded.issues.filter(
          (issue) => issue.type === "duplicate_slug",
        ).length,
        targetsWithoutSiteSuffix: loaded.corrections.filter(
          (correction) => !correction.targetHadSiteSuffix,
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
        csvCurrent: row.currentRenderedTitle,
        databaseRendered: row.renderedTitle,
      })),
    };
    const reportPath = path.join(
      options.reportDir,
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

    if (titleMismatches.length > 0) {
      await writeJson(reportPath, report);
      throw new Error(
        `Écriture bloquée : ${titleMismatches.length} titre(s) produit incohérent(s). Rapport : ${reportPath}`,
      );
    }

    const backupPath = path.join(
      options.reportDir,
      `${timestamp}-before-apply-backup.json`,
    );
    await writeJson(
      backupPath,
      pending.map((row) => ({
        _id: row.productId,
        slug: row.slug,
        title: row.databaseTitle,
        seoTitle: row.databaseSeoTitle,
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
                seoTitle: row.desiredSeoTitle,
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
