import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsManager } from "@/components/admin/products-manager";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { regionService } from "@/services/region.service";

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1;
  const limit = 20;

  const [products, categories, platformCategories, regions] = await Promise.all([
    productService.list({ page, limit }),
    categoryService.list({ page: 1, limit: 100, isPlateforme: false }),
    categoryService.list({ page: 1, limit: 100, isPlateforme: true }),
    regionService.list({ page: 1, limit: 100 }),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Produits"
        description="Créez et maintenez le catalogue de produits digitaux vendables tout en conservant un modèle de livraison manuel."
      />
      <ProductsManager
        initialProducts={products.items}
        categories={categories.items}
        platformCategories={platformCategories.items}
        regions={regions.items}
        pagination={{
          page: products.page,
          totalPages: products.totalPages,
        }}
      />
    </>
  );
}
