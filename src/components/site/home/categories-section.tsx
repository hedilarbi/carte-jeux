import Image from "next/image";

import { categories as fallbackCategories } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { cn } from "@/lib/utils/cn";
import { buildProductsHref } from "@/lib/utils/catalog-links";
import type { HomeCategoryPreview } from "@/types/home";

export function CategoriesSection({
  categories = fallbackCategories.map((category, index) => ({
    id: category.label,
    label: category.label,
    slug: category.label.toLowerCase(),
    isPlateforme: index > 0,
    sortOrder: index + 1,
  })),
}: {
  categories?: HomeCategoryPreview[];
}) {
  return (
    <section className="bg-brand-light py-8" id="categories">
      <div className="mx-auto max-w-[1350px] px-6">
        <div className="mb-7">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-purple-deep">
            {"// Plateformes"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
            Toutes les catégories
          </h2>
        </div>

        <div className="scrollbar-none -mx-6 overflow-x-auto px-6 pb-2">
          <div className="flex items-center gap-8">
            {categories.map((category, index) => (
              <a
                className={cn(
                  "flex min-w-[82px] shrink-0 flex-col items-center gap-2 text-center",
                  index === 0 && "text-brand-purple-deep",
                )}
                href={buildProductsHref(category.slug)}
                key={category.id}
              >
                {category.image ? (
                  <span className="relative size-10 overflow-hidden">
                    <Image
                      alt={category.label}
                      className="object-contain"
                      fill
                      sizes="40px"
                      src={category.image}
                    />
                  </span>
                ) : (
                  <HomeIcon
                    className="size-8 text-brand-dark transition group-hover:scale-110"
                    name={
                      fallbackCategories.find(
                        (fallbackCategory) =>
                          fallbackCategory.label.toLowerCase() ===
                          category.label.toLowerCase(),
                      )?.icon ?? "Gamepad2"
                    }
                  />
                )}
                <span className="font-heading text-xs font-bold text-brand-dark">
                  {category.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
