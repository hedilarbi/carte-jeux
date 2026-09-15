import { ProductsManager } from "@/components/admin/products-manager";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { regionService } from "@/services/region.service";

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const rawPage = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams?.page;
  const rawSearch = Array.isArray(searchParams?.search)
    ? searchParams.search[0]
    : searchParams?.search;
  const page = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const search = rawSearch?.trim() ?? "";
  const limit = 20;

  const [products, categories, platformCategories, regions] = await Promise.all([
    productService.list({ page, limit, search }),
    categoryService.list({ page: 1, limit: 100, isPlateforme: false }),
    categoryService.list({ page: 1, limit: 100, isPlateforme: true }),
    regionService.list({ page: 1, limit: 100 }),
  ]);

  return (
    <ProductsManager
      initialProducts={products.items}
      initialSearch={search}
      categories={categories.items}
      platformCategories={platformCategories.items}
      regions={regions.items}
      pagination={{
        page: products.page,
        totalPages: products.totalPages,
      }}
    />
  );
}
