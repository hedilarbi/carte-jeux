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

function addHiddenInputs(selected: CatalogSelectedFilters) {
    return (
        <>
            {selected.q ? <input name="q" type="hidden" value={selected.q} /> : null}
            {selected.region ? (
                <input name="region" type="hidden" value={selected.region} />
            ) : null}
            {selected.sort !== "popular" ? (
                <input name="sort" type="hidden" value={selected.sort} />
            ) : null}
            {selected.min ? <input name="min" type="hidden" value={selected.min} /> : null}
            {selected.max ? <input name="max" type="hidden" value={selected.max} /> : null}
        </>
    );
}

function buildProductsHref(
    selected: CatalogSelectedFilters,
    changes: Partial<CatalogSelectedFilters>,
) {
    const next = {
        ...selected,
        ...changes,
    };

    if (changes.q && changes.q === selected.q) {
        next.q = undefined;
    }

    if (changes.region && changes.region === selected.region) {
        next.region = undefined;
    }

    const params = new URLSearchParams();

    if (next.q) {
        params.set("q", next.q);
    }

    if (next.search) {
        params.set("search", next.search);
    }

    if (next.region) {
        params.set("region", next.region);
    }

    if (next.min) {
        params.set("min", next.min);
    }

    if (next.max) {
        params.set("max", next.max);
    }

    if (next.sort && next.sort !== "popular") {
        params.set("sort", next.sort);
    }

    const query = params.toString();
    return query ? `/produits?${query}` : "/produits";
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
                {addHiddenInputs(selected)}
                <Search className="size-4 shrink-0 text-brand-lilac/70" />
                <input
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                    defaultValue={selected.search}
                    name="search"
                    placeholder="Rechercher..."
                    type="search"
                />
            </form>

            <FilterGroup
                options={types}
                selected={selected}
                title="Type"
            />
            <FilterGroup
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
                        const isActive = selected.region === region.code;

                        return (
                            <Link
                                className={cn(
                                    "inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-semibold transition",
                                    isActive
                                        ? "border-brand-lavender bg-brand-lavender text-[#03030A]"
                                        : "border-white/12 bg-white/8 text-white/86 hover:border-brand-lavender/45",
                                )}
                                href={buildProductsHref(selected, {
                                    region: region.code,
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
                {selected.q ? <input name="q" type="hidden" value={selected.q} /> : null}
                {selected.region ? (
                    <input name="region" type="hidden" value={selected.region} />
                ) : null}
                {selected.search ? (
                    <input name="search" type="hidden" value={selected.search} />
                ) : null}
                {selected.sort !== "popular" ? (
                    <input name="sort" type="hidden" value={selected.sort} />
                ) : null}
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
    options,
    selected,
    title,
}: {
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
                    const isActive = selected.q === option.slug;

                    return (
                        <Link
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition",
                                isActive
                                    ? "bg-brand-lavender text-[#03030A]"
                                    : "text-white/86 hover:bg-white/10",
                            )}
                            href={buildProductsHref(selected, { q: option.slug })}
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
