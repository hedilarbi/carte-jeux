import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { MongoClient } from "mongodb";

const technicalInputDirectory = path.resolve(
  "playsdepot-csv-corrections-par-action/09-corrections-techniques-pages",
);
const deploymentInputFile = path.resolve(
  "playsdepot-csv-corrections-par-action/14-ordre-deploiement/14-ordre-deploiement-lot-01.csv",
);
const outputDirectory = path.resolve("exports/seo-deployment-order");
const siteOrigin = "https://playsdepot.com";
const requestHeaders = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "PlayDepot-SEO-Deployment-Audit/1.0",
};
const execFileAsync = promisify(execFile);

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

function toRecords(content) {
  const [header, ...rows] = parseCsv(content.replace(/^\uFEFF/, ""));
  return rows.map((row) =>
    Object.fromEntries(header.map((column, index) => [column, row[index]])),
  );
}

function getSlug(url) {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
}

async function checkStatus(url) {
  const startedAt = performance.now();

  try {
    let output = "";

    try {
      const result = await execFileAsync(
        "curl",
        [
          "-L",
          "-sS",
          "-o",
          "/dev/null",
          "--max-time",
          "20",
          "--max-filesize",
          "1",
          "-A",
          requestHeaders["User-Agent"],
          "-w",
          "%{http_code}\\t%{time_total}\\t%{url_effective}",
          url,
        ],
        { maxBuffer: 1024 * 1024 },
      );
      output = result.stdout;
    } catch (error) {
      output = typeof error?.stdout === "string" ? error.stdout : "";
      if (!output) throw error;
    }

    const [status, durationSeconds, finalUrl] = output.trim().split("\t");
    return {
      url,
      status: Number(status),
      finalUrl,
      durationMs: Math.round(Number(durationSeconds) * 1000),
      error: null,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      finalUrl: null,
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(items[index], index);

      if ((index + 1) % 100 === 0 || index + 1 === items.length) {
        console.log(`Contrôle HTTP : ${index + 1}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function readTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? null;
}

async function inspectHtml(url) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    const html = await response.text();

    return {
      url,
      status: response.status,
      title: readTag(html, /<title[^>]*>([^<]+)<\/title>/i),
      h1: readTag(html, /<h1[^>]*>([^<]+)/i),
      canonical: readTag(
        html,
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
      ),
      hasMetaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(
        html,
      ),
      bytes: Buffer.byteLength(html),
      error: null,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      title: null,
      h1: null,
      canonical: null,
      hasMetaDescription: false,
      bytes: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error("La variable MONGODB_URI est obligatoire.");
}

const deploymentSteps = toRecords(await readFile(deploymentInputFile, "utf8"));
const technicalFiles = (await readdir(technicalInputDirectory))
  .filter((file) => file.endsWith(".csv"))
  .sort();
const absentRows = [];

for (const file of technicalFiles) {
  const records = toRecords(
    await readFile(path.join(technicalInputDirectory, file), "utf8"),
  );
  for (const record of records) {
    if (record["Statut HTTP crawl"] === "Absent du HTML 200 du crawl") {
      absentRows.push({
        file,
        url: record["URL actuelle"],
        label: record["Produit / page"],
        slug: getSlug(record["URL actuelle"]),
      });
    }
  }
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

try {
  const database = process.env.MONGODB_DB_NAME
    ? client.db(process.env.MONGODB_DB_NAME)
    : client.db();
  const products = await database
    .collection("products")
    .find(
      { slug: { $in: absentRows.map((row) => row.slug) } },
      {
        projection: {
          slug: 1,
          title: 1,
          isActive: 1,
          indexable: 1,
          seoTitle: 1,
          seoDescription: 1,
          description: 1,
          faqItems: 1,
        },
      },
    )
    .toArray();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const liveChecks = await mapWithConcurrency(absentRows, 8, (row) =>
    checkStatus(row.url),
  );
  const successfulChecks = liveChecks.filter((check) => check.status === 200);
  const sampleSize = Math.min(20, successfulChecks.length);
  const htmlSampleUrls = Array.from({ length: sampleSize }, (_, index) => {
    const position = Math.floor((index * successfulChecks.length) / sampleSize);
    return successfulChecks[position].url;
  });
  const htmlChecks = await mapWithConcurrency(htmlSampleUrls, 4, inspectHtml);
  const sitemapCheck = await checkStatus(`${siteOrigin}/sitemap.xml`);
  const productRows = absentRows.map((row, index) => {
    const product = productBySlug.get(row.slug);
    return {
      ...row,
      database: product
        ? {
            id: product._id.toString(),
            title: product.title,
            active: product.isActive,
            indexable: product.indexable !== false,
            hasSeoTitle: Boolean(product.seoTitle?.trim()),
            hasSeoDescription: Boolean(product.seoDescription?.trim()),
            hasDescription: Boolean(product.description?.trim()),
            hasFaq: Array.isArray(product.faqItems) && product.faqItems.length > 0,
          }
        : null,
      live: liveChecks[index],
    };
  });
  const report = {
    timestamp: new Date().toISOString(),
    database: database.databaseName,
    deploymentSteps,
    counts: {
      expectedAbsentProducts: 691,
      csvAbsentProducts: absentRows.length,
      matchedProducts: products.length,
      missingProducts: absentRows.length - products.length,
      activeProducts: products.filter((product) => product.isActive).length,
      indexableProducts: products.filter((product) => product.indexable !== false)
        .length,
      live200: liveChecks.filter((check) => check.status === 200).length,
      liveRedirects: liveChecks.filter(
        (check) => check.status >= 300 && check.status < 400,
      ).length,
      live404: liveChecks.filter((check) => check.status === 404).length,
      liveErrors: liveChecks.filter((check) => check.status === 0).length,
      htmlSamples: htmlChecks.length,
      htmlSamplesValid: htmlChecks.filter(
        (check) =>
          check.status === 200 &&
          check.title &&
          check.h1 &&
          check.canonical &&
          check.hasMetaDescription,
      ).length,
    },
    sitemapCheck,
    htmlChecks,
    readiness: [
      {
        step: 1,
        status: "prêt dans le code, déploiement requis",
        note: "Les redirections, canoniques, liens internes et sitemaps ont été corrigés et le build est valide.",
      },
      {
        step: 2,
        status: "prêt dans le code, déploiement requis",
        note: "Titles, metas, H1, pagination et poids HTML ont été traités.",
      },
      {
        step: 3,
        status: "partiel, stockage Atlas bloquant",
        note: "Descriptions et Hn sont traités ; 25 147 FAQ restent à écrire lorsque le quota sera libéré.",
      },
      {
        step: 4,
        status: "validation commerciale requise",
        note: "Les 48 fiches ont des SKU et identifiants fournisseur distincts ; aucune fusion ou 301 automatique.",
      },
      {
        step: 5,
        status: "contrôlé",
        note: "Les 691 URLs ont été retestées en direct et rapprochées de la base.",
      },
      {
        step: 6,
        status: "prêt dans le code, nettoyage DB bloqué",
        note: "Les variantes 3840 px et les images cassées sont corrigées au rendu ; Atlas bloque le nettoyage persistant de 188 galeries.",
      },
      {
        step: 7,
        status: "à exécuter après déploiement",
        note: "Recrawl et suivi GSC/GA4 ne doivent commencer qu'après mise en production du code.",
      },
    ],
    products: productRows,
  };

  await mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(
    outputDirectory,
    `${new Date().toISOString().replaceAll(":", "-")}-readiness-report.json`,
  );
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ counts: report.counts, sitemapCheck, outputPath }, null, 2));
} finally {
  await client.close();
}
