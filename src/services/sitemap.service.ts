import { connectToDatabase } from "@/lib/db/mongoose";
import {
  buildCategoryHref,
  normalizeCanonicalUrl,
  toAbsoluteUrl,
} from "@/lib/utils/catalog-links";
import { CategoryModel } from "@/models/category.model";
import { ProductModel } from "@/models/product.model";

// Well under the 50,000 URL protocol limit: each file stays around 1.5 MB, so a
// regeneration reads one small slice of the `sitemap_products_covered` index.
export const PRODUCTS_PER_SITEMAP = 10_000;

// Same rules as the pages themselves: product pages 404 when inactive and are
// noindex when `indexable` is false; category pages are noindex unless `indexable`.
const INDEXABLE_PRODUCT_FILTER = { isActive: true, indexable: { $ne: false } };
const INDEXABLE_CATEGORY_FILTER = { isActive: true, indexable: true };

const STATIC_PAGES = [
  "/",
  "/produits",
  "/categories",
  "/precommande-gta-vi",
  "/precommande-fc27",
  "/cgv",
  "/obtenir-votre-produit",
];

interface SitemapUrl {
  loc: string;
  lastmod?: Date;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderUrlSet(urls: SitemapUrl[]) {
  const entries = urls.map(({ loc, lastmod }) => {
    const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
    return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

function renderSitemapIndex(locs: string[]) {
  const entries = locs.map(
    (loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>\n`;
}

async function countProductSitemaps() {
  await connectToDatabase();
  const totalProducts = await ProductModel.countDocuments(
    INDEXABLE_PRODUCT_FILTER,
  );

  return Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP));
}

export const sitemapService = {
  async renderIndex() {
    const productSitemapCount = await countProductSitemaps();
    const locs = [
      toAbsoluteUrl("/sitemap-pages.xml"),
      toAbsoluteUrl("/sitemap-categories.xml"),
      ...Array.from({ length: productSitemapCount }, (_, index) =>
        toAbsoluteUrl(`/sitemap-products-${index + 1}.xml`),
      ),
    ];

    return renderSitemapIndex(locs);
  },

  renderPages() {
    return renderUrlSet(STATIC_PAGES.map((path) => ({ loc: toAbsoluteUrl(path) })));
  },

  async renderCategories() {
    await connectToDatabase();
    const categories = await CategoryModel.find(INDEXABLE_CATEGORY_FILTER, {
      canonical: 1,
      isPlateforme: 1,
      slug: 1,
      updatedAt: 1,
    })
      .sort({ sortOrder: 1, _id: 1 })
      .lean();

    const urls = categories.flatMap((category): SitemapUrl[] => {
      const loc = toAbsoluteUrl(
        buildCategoryHref(category.slug, Boolean(category.isPlateforme)),
      );

      // A category canonicalised elsewhere is not self-canonical: keep it out.
      if (category.canonical && normalizeCanonicalUrl(category.canonical) !== loc) {
        return [];
      }

      return [{ loc, lastmod: category.updatedAt }];
    });

    return renderUrlSet(urls);
  },

  // `chunk` is 1-based. Returns null past the last chunk so the route can 404.
  async renderProducts(chunk: number) {
    await connectToDatabase();
    // Projection limited to indexed fields, sorted by `_id`: with the
    // `sitemap_products_covered` index, MongoDB answers from the index alone
    // (skip included) without loading any product document.
    const products = await ProductModel.find(INDEXABLE_PRODUCT_FILTER, {
      _id: 1,
      slug: 1,
      updatedAt: 1,
    })
      .sort({ _id: 1 })
      .skip((chunk - 1) * PRODUCTS_PER_SITEMAP)
      .limit(PRODUCTS_PER_SITEMAP)
      .lean();

    if (products.length === 0 && chunk > 1) {
      return null;
    }

    return renderUrlSet(
      products.map((product) => ({
        loc: toAbsoluteUrl(`/produits/${encodeURIComponent(product.slug)}`),
        lastmod: product.updatedAt,
      })),
    );
  },
};
