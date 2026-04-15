import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { categoryService } from "@/services/category.service";

export default async function AdminCategoriesPage() {
  const categories = await categoryService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Control the top-level product taxonomy used by the marketplace catalog and admin workflows."
      />
      <CategoriesManager initialCategories={categories.items} />
    </>
  );
}
