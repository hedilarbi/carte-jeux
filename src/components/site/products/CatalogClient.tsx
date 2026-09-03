"use client";

import { useState } from "react";
import FilterSection from "./FilterSection";
import MainSection from "./MainSection";
import { MobileFilterDrawer } from "./mobile-filter-drawer";
import type { CatalogPageContent, CatalogSelectedFilters } from "@/types/catalog";

export default function CatalogClient({
  initialContent,
  categorySlug,
  isPlateforme,
}: {
  initialContent: CatalogPageContent;
  categorySlug?: string;
  isPlateforme?: boolean;
}) {
  const [content, setContent] = useState<CatalogPageContent>(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async (
    newSelected: CatalogSelectedFilters,
    page: number = 1
  ) => {
    setIsLoading(true);
    try {
      // Build request body matching API
      const body: any = {
        platforms: newSelected.platforms,
        types: newSelected.types,
        regions: newSelected.regions,
        search: newSelected.search,
        min: newSelected.min,
        max: newSelected.max,
        sort: newSelected.sort,
        page,
      };
      
      if (categorySlug) {
        if (isPlateforme) {
          body.platforms = [categorySlug];
        } else {
          body.types = [categorySlug];
        }
      }

      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newContent = await res.json();
        setContent(newContent);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    newSelected: CatalogSelectedFilters,
    reset = false
  ) => {
    if (reset) {
      const resetFilters = {
        platforms: [],
        regions: [],
        types: [],
        sort: "popular",
      };
      fetchProducts(resetFilters, 1);
    } else {
      fetchProducts(newSelected, 1);
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(content.selected, page);
  };

  return (
    <div className={`mx-auto flex w-full max-w-[1350px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-start ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
      <FilterSection
        className="hidden lg:block"
        platforms={content.filters.platforms}
        regions={content.filters.regions}
        selected={content.selected}
        types={content.filters.types}
        onFilterChange={handleFilterChange}
      />
      <MainSection
        content={content}
        onPageChange={handlePageChange}
        onSortChange={(sort) =>
          handleFilterChange({ ...content.selected, sort })
        }
        mobileFilters={
          <MobileFilterDrawer
            key={JSON.stringify(content.selected)}
            selected={content.selected}
          >
            <FilterSection
              className="w-full shadow-none"
              groupsOpenByDefault={false}
              platforms={content.filters.platforms}
              regions={content.filters.regions}
              selected={content.selected}
              types={content.filters.types}
              onFilterChange={handleFilterChange}
            />
          </MobileFilterDrawer>
        }
      />
    </div>
  );
}
