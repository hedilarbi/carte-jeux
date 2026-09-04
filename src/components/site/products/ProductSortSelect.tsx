"use client";

import type { CatalogSelectedFilters } from "@/types/catalog";

export function ProductSortSelect({
  selected,
  onSortChange,
}: {
  selected: CatalogSelectedFilters;
  onSortChange?: (sort: string) => void;
}) {
  return (
    <select
      aria-label="Trier les produits"
      className="min-w-0 bg-transparent font-semibold outline-none"
      defaultValue={selected.sort}
      onChange={(event) => onSortChange?.(event.target.value)}
    >
      <option value="popular">Les plus populaires</option>
      <option value="price-asc">Prix croissant</option>
      <option value="price-desc">Prix décroissant</option>
      <option value="new">Nouveautés</option>
    </select>
  );
}
