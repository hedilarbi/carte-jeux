import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type {
  CatalogCategoryFilter,
  CatalogRegionFilter,
  CatalogSelectedFilters,
} from "@/types/catalog";

interface FilterSectionProps {
    platforms: CatalogCategoryFilter[];
    regions: CatalogRegionFilter[];
    selected: CatalogSelectedFilters;
    types: CatalogCategoryFilter[];
}

type ToggleFilterKey = "platforms" | "regions" | "types";
type HiddenInputName =
    | "max"
    | "min"
    | "platforms"
    | "regions"
    | "search"
    | "sort"
    | "types";

function isHidden(name: HiddenInputName, omit: HiddenInputName[]) {
    return omit.includes(name);
}

function HiddenFilterInputs({
    omit = [],
    selected,
}: {
    omit?: HiddenInputName[];
    selected: CatalogSelectedFilters;
}) {
    return (
        <>
            {!isHidden("types", omit)
                ? selected.types.map((type) => (
                      <input
                          key={`type-${type}`}
                          name="type"
                          type="hidden"
                          value={type}
                      />
                  ))
                : null}
            {!isHidden("platforms", omit)
                ? selected.platforms.map((platform) => (
                      <input
                          key={`platform-${platform}`}
                          name="platform"
                          type="hidden"
                          value={platform}
                      />
                  ))
                : null}
            {!isHidden("regions", omit)
                ? selected.regions.map((region) => (
                      <input
                          key={`region-${region}`}
                          name="region"
                          type="hidden"
                          value={region}
                      />
                  ))
                : null}
            {!isHidden("search", omit) && selected.search ? (
                <input name="search" type="hidden" value={selected.search} />
            ) : null}
            {!isHidden("sort", omit) && selected.sort !== "popular" ? (
                <input name="sort" type="hidden" value={selected.sort} />
            ) : null}
            {!isHidden("min", omit) && selected.min ? (
                <input name="min" type="hidden" value={selected.min} />
            ) : null}
            {!isHidden("max", omit) && selected.max ? (
                <input name="max" type="hidden" value={selected.max} />
            ) : null}
        </>
    );
}

function toggleValue(values: string[], value: string) {
    return values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
}

function appendSelectedParams(
    params: URLSearchParams,
    selected: CatalogSelectedFilters,
) {
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

    if (selected.sort && selected.sort !== "popular") {
        params.set("sort", selected.sort);
    }
}

function buildProductsHref({
    filterKey,
    selected,
    value,
}: {
    filterKey: ToggleFilterKey;
    selected: CatalogSelectedFilters;
    value: string;
}) {
    const next = {
        ...selected,
        platforms: [...selected.platforms],
        regions: [...selected.regions],
        types: [...selected.types],
    };

    next[filterKey] = toggleValue(next[filterKey], value);

    const params = new URLSearchParams();
    appendSelectedParams(params, next);

    const query = params.toString();
    return query ? `/produits?${query}` : "/produits";
}

function hasActiveFilters(selected: CatalogSelectedFilters) {
    return (
        selected.types.length > 0 ||
        selected.platforms.length > 0 ||
        selected.regions.length > 0 ||
        Boolean(selected.search || selected.min || selected.max) ||
        selected.sort !== "popular"
    );
}

export default function FilterSection({
    platforms,
    regions,
    selected,
    types,
}: FilterSectionProps) {
    return (
        <aside className="w-[285px] shrink-0 bg-[#064FB1] p-5 text-white shadow-[0_18px_48px_rgba(1,45,105,0.28)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-lilac/75">
                        Catalogue
                    </span>
                    <h2 className="mt-1 font-heading text-lg font-bold">Filtres</h2>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/12 text-brand-lilac">
                    <SlidersHorizontal className="size-4" />
                </span>
            </div>

            <form
                action="/produits"
                className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#0F0F28]/55 px-3"
                method="get"
            >
                <HiddenFilterInputs omit={["search"]} selected={selected} />
                <Search className="size-4 shrink-0 text-brand-lilac/70" />
                <input
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                    defaultValue={selected.search}
                    name="search"
                    placeholder="Rechercher..."
                    type="search"
                />
            </form>

            {hasActiveFilters(selected) ? (
                <Link
                    className="mt-3 flex h-9 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-xs font-black uppercase tracking-[0.08em] text-white/86 transition hover:border-brand-lavender/45"
                    href="/produits"
                >
                    Réinitialiser
                </Link>
            ) : null}

            <FilterGroup
                filterKey="types"
                options={types}
                selected={selected}
                title="Type"
            />
            <FilterGroup
                filterKey="platforms"
                options={platforms}
                selected={selected}
                title="Plateforme"
            />

            <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-mono text-[14px] font-bold uppercase tracking-[0.12em] text-brand-lilac/70">
                    Région
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {regions.map((region) => {
                        const isActive = selected.regions.includes(region.code);

                        return (
                            <Link
                                className={cn(
                                    "inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-semibold transition",
                                    isActive
                                        ? "border-brand-lavender bg-brand-lavender text-[#03030A]"
                                        : "border-white/12 bg-white/8 text-white/86 hover:border-brand-lavender/45",
                                )}
                                href={buildProductsHref({
                                    filterKey: "regions",
                                    selected,
                                    value: region.code,
                                })}
                                key={region.id}
                            >
                                {region.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <form
                action="/produits"
                className="mt-5 border-t border-white/10 pt-4"
                method="get"
            >
                <HiddenFilterInputs omit={["max", "min"]} selected={selected} />
                <p className="font-mono text-[14px] font-bold uppercase tracking-[0.12em] text-brand-lilac/70">
                    Prix
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                        className="h-10 min-w-0 rounded-lg border border-white/12 bg-[#0F0F28]/55 px-3 font-mono text-xs text-white outline-none placeholder:text-white/45"
                        defaultValue={selected.min}
                        name="min"
                        placeholder="Min"
                        type="number"
                    />
                    <input
                        className="h-10 min-w-0 rounded-lg border border-white/12 bg-[#0F0F28]/55 px-3 font-mono text-xs text-white outline-none placeholder:text-white/45"
                        defaultValue={selected.max}
                        name="max"
                        placeholder="Max"
                        type="number"
                    />
                </div>
                <button
                    className="mt-3 h-10 w-full rounded-lg bg-brand-lavender text-xs font-black uppercase text-[#03030A] transition hover:bg-brand-blue-mist"
                    type="submit"
                >
                    Appliquer
                </button>
            </form>
        </aside>
    );
}

function FilterGroup({
    filterKey,
    options,
    selected,
    title,
}: {
    filterKey: "platforms" | "types";
    options: CatalogCategoryFilter[];
    selected: CatalogSelectedFilters;
    title: string;
}) {
    return (
        <details className="group mt-5 border-t border-white/10 pt-4" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[14px] font-bold uppercase tracking-[0.12em] text-brand-lilac/70">
                    {title}
                </span>
                <ChevronDown className="size-4 text-brand-lilac/70 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 grid gap-2">
                {options.map((option) => {
                    const isActive = selected[filterKey].includes(option.slug);

                    return (
                        <Link
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition",
                                isActive
                                    ? "bg-brand-lavender text-[#03030A]"
                                    : "text-white/86 hover:bg-white/10",
                            )}
                            href={buildProductsHref({
                                filterKey,
                                selected,
                                value: option.slug,
                            })}
                            key={option.id}
                        >
                            <span
                                className={cn(
                                    "size-4 rounded border",
                                    isActive
                                        ? "border-[#03030A] bg-[#03030A]"
                                        : "border-white/30",
                                )}
                            />
                            <span>{option.label}</span>
                        </Link>
                    );
                })}
            </div>
        </details>
    );
}
