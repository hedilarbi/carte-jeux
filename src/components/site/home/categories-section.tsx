import { categories } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { cn } from "@/lib/utils/cn";

export function CategoriesSection() {
  return (
    <section className="bg-brand-light py-8" id="categories">
      <div className="mx-auto max-w-[1200px] px-6">
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
                href="#products"
                key={category.label}
              >
                <HomeIcon
                  className="size-8 text-brand-dark transition group-hover:scale-110"
                  name={category.icon}
                />
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
