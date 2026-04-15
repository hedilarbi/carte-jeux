import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsManager } from "@/components/admin/products-manager";
import { categoryService } from "@/services/category.service";
import { platformService } from "@/services/platform.service";
import { productService } from "@/services/product.service";
import { regionService } from "@/services/region.service";

export default async function AdminProductsPage() {
  const [products, categories, platforms, regions] = await Promise.all([
    productService.list({ page: 1, limit: 100 }),
    categoryService.list({ page: 1, limit: 100 }),
    platformService.list({ page: 1, limit: 100 }),
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
        platforms={platforms.items}
        regions={regions.items}
      />
    </>
  );
}
