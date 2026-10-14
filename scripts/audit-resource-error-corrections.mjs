import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const inputDirectory = path.resolve(
  "playsdepot-csv-corrections-par-action/11-ressources-erreurs",
);
const outputDirectory = path.resolve("exports/seo-resource-error-corrections");

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

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith(".csv"))
  .sort();
const records = [];

for (const file of files) {
  const content = (await readFile(path.join(inputDirectory, file), "utf8")).replace(
    /^\uFEFF/,
    "",
  );
  const [header, ...rows] = parseCsv(content);

  if (header.length !== 11 || rows.some((row) => row.length !== header.length)) {
    throw new Error(`Structure CSV invalide dans ${file}.`);
  }

  for (const row of rows) {
    records.push(Object.fromEntries(header.map((column, index) => [column, row[index]])));
  }
}

const byType = {};
const byStatus = {};
const bySignal = {};
const byPriority = {};
const byWidth = {};
const bySourceHost = {};
let totalBytes = 0;
let maxBytes = 0;

for (const record of records) {
  increment(byType, record.Type);
  increment(byStatus, record["Statut HTTP crawl"]);
  increment(bySignal, record["Signal crawler"]);
  increment(byPriority, record.Priorité);

  const bytes = Number(record["Taille réponse (octets)"]) || 0;
  totalBytes += bytes;
  maxBytes = Math.max(maxBytes, bytes);

  const resourceUrl = new URL(record["URL ressource / page"]);
  const width = resourceUrl.searchParams.get("w") ?? "sans largeur";
  increment(byWidth, width);

  const source = record["Source image encodée"];
  const host = source.startsWith("http") ? new URL(source).hostname : "locale ou absente";
  increment(bySourceHost, host);
}

const failures = records
  .filter((record) => record["Statut HTTP crawl"] !== "200 OK")
  .map((record) => ({
    id: record["ID crawl"],
    url: record["URL ressource / page"],
    type: record.Type,
    status: record["Statut HTTP crawl"],
    source: record["Source image encodée"],
    incomingLinks: Number(record["Liens entrants"]) || 0,
    action: record["Action à faire"],
    verification: record.Vérification,
  }));

const report = {
  timestamp: new Date().toISOString(),
  inputFiles: files,
  counts: {
    rows: records.length,
    successful: byStatus["200 OK"] ?? 0,
    failures: failures.length,
    totalBytes,
    averageBytes: Math.round(totalBytes / records.length),
    maxBytes,
  },
  byType,
  byStatus,
  bySignal,
  byPriority,
  byWidth,
  bySourceHost,
  decision: {
    maxImageWidth:
      "Retirer les paliers Next.js 2048 et 3840 afin que les gabarits ne publient plus de variantes surdimensionnées.",
    failedResources:
      "Ne pas modifier les produits sur la base d'un crawl historique : les timeouts doivent être retestés et les 404 confirmées avant remplacement de leur source.",
  },
  failures,
};

await mkdir(outputDirectory, { recursive: true });
const outputPath = path.join(
  outputDirectory,
  `${new Date().toISOString().replaceAll(":", "-")}-audit-report.json`,
);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({ ...report.counts, byStatus, byWidth, outputPath }, null, 2));
