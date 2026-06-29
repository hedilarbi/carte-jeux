import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BestSellerManager } from "@/components/admin/best-seller-manager";
import { bestSellerService } from "@/services/best-seller.service";
import { productService } from "@/services/product.service";

export default async function AdminBestSellerPage() {
  const [bestSellerItems, products] = await Promise.all([
    bestSellerService.list(),
    productService.listActiveForSelection(),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Accueil"
        title="Best seller"
        description="Choisissez les produits affichés dans la section Les meilleurs vendus de la page d'accueil et contrôlez leur ordre d'affichage."
      />
      <BestSellerManager
        initialItems={bestSellerItems}
        products={products}
      />
    </>
  );
}
