import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomeCategoriesManager } from "@/components/admin/home-categories-manager";
import { categoryService } from "@/services/category.service";
import { homeCategorySectionService } from "@/services/home-category-section.service";

export default async function AdminHomeCategoriesPage() {
  const [selection, categories] = await Promise.all([
    homeCategorySectionService.list(),
    categoryService.list({ page: 1, limit: 100, isActive: true }),
  ]);

  const initialCategories = selection.isConfigured
    ? selection.categories
    : categories.items.slice(0, 16);

  return (
    <>
      <AdminPageHeader
        eyebrow="Accueil"
        title="Section catégorie"
        description="Choisissez et ordonnez les catégories affichées dans la section Nos catégories de l'accueil client."
      />
      <HomeCategoriesManager
        categories={categories.items}
        initialCategories={initialCategories}
      />
    </>
  );
}
