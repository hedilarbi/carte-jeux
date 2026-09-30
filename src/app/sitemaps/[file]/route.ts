import { sitemapService } from "@/services/sitemap.service";

// Served through the rewrites in next.config.ts:
//   /sitemap.xml            -> /sitemaps/index.xml
//   /sitemap-pages.xml      -> /sitemaps/pages.xml
//   /sitemap-categories.xml -> /sitemaps/categories.xml
//   /sitemap-products-N.xml -> /sitemaps/products-N.xml
//
// Incremental Static Regeneration: nothing is generated at build time (empty
// generateStaticParams), each file is generated on its first request, then served
// from cache and regenerated in the background at most once every 6 hours,
// whatever the number of bots hitting it. Slug changes show up within 6 hours.
export const revalidate = 21600;

export async function generateStaticParams() {
  return [];
}

type SitemapRouteContext = {
  params: Promise<{
    file: string;
  }>;
};

const PRODUCT_SITEMAP_PATTERN = /^products-([1-9]\d{0,3})\.xml$/;

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function notFoundResponse() {
  return new Response("Not Found", { status: 404 });
}

export async function GET(_request: Request, context: SitemapRouteContext) {
  const { file } = await context.params;

  if (file === "index.xml") {
    return xmlResponse(await sitemapService.renderIndex());
  }

  if (file === "pages.xml") {
    return xmlResponse(sitemapService.renderPages());
  }

  if (file === "categories.xml") {
    return xmlResponse(await sitemapService.renderCategories());
  }

  const productMatch = PRODUCT_SITEMAP_PATTERN.exec(file);

  if (productMatch) {
    const body = await sitemapService.renderProducts(Number(productMatch[1]));
    return body ? xmlResponse(body) : notFoundResponse();
  }

  return notFoundResponse();
}
