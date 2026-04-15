import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { categoryService } from "@/services/category.service";

export default async function AdminCategoriesPage() {
  const categories = await categoryService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Catégories"
        description="Contrôlez la taxonomie de premier niveau utilisée par le catalogue marketplace et les workflows d'administration."
      />
      <CategoriesManager initialCategories={categories.items} />
    </>
  );
}
