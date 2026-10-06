import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { MongoClient } from "mongodb";

// Writes the SEO content of scripts/data/category-seo.json (title, meta, H1, intro,
// H2 sections, FAQ) onto the matching categories. Dry run unless `--apply` is passed.
//
//   node scripts/seed-category-seo.mjs            # dry run: validates and reports
//   node scripts/seed-category-seo.mjs --apply    # backs up current values, then writes

const DATA_PATH = "scripts/data/category-seo.json";
const BACKUP_DIR = "exports";
// Pending legal validation in Tunisia: stays out of the index and the sitemap.
const NOINDEX_SLUGS = new Set(["crypto-voucher"]);
const LIMITS = { seoTitle: 160, metaDescription: 320, h1: 160, intro: 2000 };
const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function loadEnv(contents) {
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    const separatorIndex = line.indexOf("=");

    if (!line || line.startsWith("#") || separatorIndex < 1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (/^(".*"|'.*')$/.test(value)) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function validate(entries) {
  const errors = [];
  const seen = { seoTitle: new Set(), metaDescription: new Set() };
  const paths = new Set(
    entries.map(
      (e) => `/categories/${e.isPlateforme ? "plateformes" : "types"}/${e.slug}`,
    ),
  );

  for (const entry of entries) {
    const label = entry.slug;

    for (const [field, max] of Object.entries(LIMITS)) {
      if (!entry[field]) {
        errors.push(`${label}: ${field} manquant`);
      } else if (entry[field].length > max) {
        errors.push(`${label}: ${field} dépasse ${max} caractères`);
      }
    }

    for (const field of ["seoTitle", "metaDescription"]) {
      if (seen[field].has(entry[field])) {
        errors.push(`${label}: ${field} en doublon`);
      }
      seen[field].add(entry[field]);
    }

    if (entry.sections.length !== 4) {
      errors.push(`${label}: ${entry.sections.length} blocs H2 au lieu de 4`);
    }

    if (entry.faq.length !== 7) {
      errors.push(`${label}: ${entry.faq.length} questions au lieu de 7`);
    }

    for (const section of entry.sections) {
      for (const paragraph of section.paragraphs) {
        for (const [, , href] of paragraph.matchAll(LINK_PATTERN)) {
          if (!paths.has(href)) {
            errors.push(`${label}: lien vers ${href} sans page dans le document`);
          }
        }
      }
    }
  }

  return errors;
}

async function main() {
  const apply = process.argv.includes("--apply");

  try {
    loadEnv(await readFile(resolve(".env.local"), "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  const entries = JSON.parse(await readFile(resolve(DATA_PATH), "utf8"));
  const errors = validate(entries);

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB_NAME);
    const categories = db.collection("categories");
    console.log(`Base: ${db.databaseName} (${apply ? "ÉCRITURE" : "simulation"})`);

    const missing = [];
    const backup = [];
    const targets = [];

    for (const entry of entries) {
      const filter = { slug: entry.slug, isPlateforme: entry.isPlateforme };
      const current = await categories.findOne(filter, {
        projection: {
          seoTitle: 1,
          metaDescription: 1,
          h1: 1,
          intro: 1,
          sections: 1,
          faq: 1,
          indexable: 1,
          updatedAt: 1,
        },
      });

      if (!current) {
        missing.push(entry.slug);
        continue;
      }

      backup.push(current);
      targets.push({ entry, filter });
    }

    if (missing.length > 0) {
      console.error(`Catégories introuvables: ${missing.join(", ")}`);
      process.exit(1);
    }

    // The previous values are saved before anything is written.
    if (apply) {
      const backupPath = resolve(
        BACKUP_DIR,
        `category-seo-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
      );
      await mkdir(dirname(backupPath), { recursive: true });
      await writeFile(backupPath, JSON.stringify(backup, null, 2));
      console.log(`Valeurs précédentes sauvegardées: ${backupPath}`);
    }

    for (const { entry, filter } of targets) {
      const indexable = !NOINDEX_SLUGS.has(entry.slug);

      if (apply) {
        await categories.updateOne(filter, {
          $set: {
            seoTitle: entry.seoTitle,
            metaDescription: entry.metaDescription,
            h1: entry.h1,
            intro: entry.intro,
            sections: entry.sections,
            faq: entry.faq,
            // Only forced for the pages that must stay out of the index.
            ...(indexable ? {} : { indexable: false }),
            updatedAt: new Date(),
          },
        });
      }

      console.log(
        `${apply ? "écrit " : "ok    "} ${entry.slug} — ${entry.sections.length} blocs, ${entry.faq.length} questions${indexable ? "" : " — NOINDEX"}`,
      );
    }
  } finally {
    await client.close();
  }
}

await main();
