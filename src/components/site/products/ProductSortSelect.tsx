"use client";

import { useRouter } from "next/navigation";

import type { CatalogSelectedFilters } from "@/types/catalog";

function buildSortHref(selected: CatalogSelectedFilters, sort: string) {
  const params = new URLSearchParams();

  selected.types.forEach((type) => params.append("type", type));
  selected.platforms.forEach((platform) => params.append("platform", platform));
  selected.regions.forEach((region) => params.append("region", region));

  if (selected.search) {
    params.set("search", selected.search);
  }

  if (selected.min) {
    params.set("min", selected.min);
  }

  if (selected.max) {
    params.set("max", selected.max);
  }

  if (sort !== "popular") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/produits?${query}` : "/produits";
}

export function ProductSortSelect({
  selected,
}: {
  selected: CatalogSelectedFilters;
}) {
  const router = useRouter();

  return (
    <select
      aria-label="Trier les produits"
      className="min-w-0 bg-transparent font-semibold outline-none"
      defaultValue={selected.sort}
      onChange={(event) => router.push(buildSortHref(selected, event.target.value))}
    >
      <option value="popular">Les plus populaires</option>
      <option value="price-asc">Prix croissant</option>
      <option value="price-desc">Prix décroissant</option>
      <option value="new">Nouveautés</option>
    </select>
  );
}
