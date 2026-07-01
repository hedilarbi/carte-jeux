import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
    FlashDealCard,
    type FlashDealProduct,
} from "@/components/site/home/flash-deals-carousel";
import { ProductSortSelect } from "@/components/site/products/ProductSortSelect";
import type { CatalogPageContent, CatalogProduct } from "@/types/catalog";

interface MainSectionProps {
    content: CatalogPageContent;
}

function resolvePageTitle(content: CatalogPageContent) {
    const activeLabels = [
        ...content.activeFilters.platforms.map((platform) => platform.label),
        ...content.activeFilters.types.map((type) => type.label),
    ];

    if (content.activeCategory && activeLabels.length === 1) {
        return `${content.activeCategory.label} Tunisie - Codes et recharges gaming`;
    }

    if (activeLabels.length > 0) {
        return `${activeLabels.join(" + ")} - Produits gaming Tunisie`;
    }

    return "Produits gaming Tunisie - Cartes, jeux et recharges";
}

function buildPaginationHref(content: CatalogPageContent, page: number) {
    const { selected } = content;
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

    if (selected.sort !== "popular") {
        params.set("sort", selected.sort);
    }

    params.set("page", String(page));
    params.set("limit", String(content.pagination.limit));

    return `/produits?${params.toString()}`;
}

function getPaginationPages(currentPage: number, totalPages: number) {
    const pages = new Set([1, totalPages]);

    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page > 0 && page <= totalPages) {
            pages.add(page);
        }
    }

    return Array.from(pages).sort((first, second) => first - second);
}

export default function MainSection({ content }: MainSectionProps) {
    const title = resolvePageTitle(content);

    return (
        <section className="min-w-0 flex-1">
            <Link
                aria-label="Précommander GTA VI"
                className="relative block h-[180px] overflow-hidden border border-brand-ice/20 bg-brand-navy shadow-[0_18px_44px_rgba(1,45,105,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(1,45,105,0.28)] sm:h-[240px] lg:h-[284px]"
                href="/precommande-gta-vi"
            >
                <Image
                    alt="Catalogue de cartes et recharges gaming"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 883px"
                    src="/banner_products.jpg"
                />
            </Link>

            <div className="mt-8">
                <h1 className="font-heading text-2xl font-black leading-tight text-brand-dark sm:text-3xl">
                    {title}
                </h1>

                <div className="mt-5 flex flex-col gap-4 rounded-[18px] border border-brand-ice/18 bg-white/72 p-4 shadow-[0_12px_34px_rgba(1,45,105,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-brand-navy/72">
                        Résultats trouvés :{" "}
                        <span className="text-brand-dark">{content.totalItems}</span>
                    </p>

                    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-navy/10 bg-white px-4 py-3 text-sm font-semibold text-brand-dark md:w-auto">
                        <span className="shrink-0 font-mono text-xs uppercase text-brand-navy/55">
                            Popularité :
                        </span>
                        <ProductSortSelect selected={content.selected} />
                    </div>
                </div>
            </div>

            {content.products.length > 0 ? (
                <>
                    <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                        {content.products.map((product) => (
                            <ProductResultCard key={product.id} product={product} />
                        ))}
                    </div>
                    <CatalogPagination content={content} />
                </>
            ) : (
                <div className="mt-8 rounded-[18px] border border-brand-ice/18 bg-white/72 p-8 text-center text-brand-dark shadow-[0_12px_34px_rgba(1,45,105,0.08)]">
                    <h2 className="font-heading text-xl font-black">
                        Aucun produit trouvé
                    </h2>
                    <p className="mt-2 text-sm text-brand-navy/70">
                        Essayez une autre catégorie, plateforme ou recherche.
                    </p>
                </div>
            )}
        </section>
    );
}

function CatalogPagination({ content }: { content: CatalogPageContent }) {
    const { pagination } = content;

    if (pagination.totalPages <= 1) {
        return null;
    }

    const pages = getPaginationPages(pagination.page, pagination.totalPages);

    return (
        <nav
            aria-label="Pagination des produits"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
            {pagination.hasPreviousPage ? (
                <Link
                    aria-label="Page précédente"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                    href={buildPaginationHref(content, pagination.page - 1)}
                >
                    <ChevronLeft className="size-4" />
                </Link>
            ) : (
                <span
                    aria-disabled="true"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/10 bg-white/50 text-brand-navy/35"
                >
                    <ChevronLeft className="size-4" />
                </span>
            )}

            {pages.map((page, index) => (
                <span className="contents" key={page}>
                    {index > 0 && page - pages[index - 1] > 1 ? (
                        <span aria-hidden="true" className="px-1 text-brand-navy/55">
                            …
                        </span>
                    ) : null}
                    {page === pagination.page ? (
                        <span
                            aria-current="page"
                            className="flex size-10 items-center justify-center rounded-lg bg-brand-lavender text-sm font-black text-[#03030A]"
                        >
                            {page}
                        </span>
                    ) : (
                        <Link
                            className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white text-sm font-bold text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                            href={buildPaginationHref(content, page)}
                        >
                            {page}
                        </Link>
                    )}
                </span>
            ))}

            {pagination.hasNextPage ? (
                <Link
                    aria-label="Page suivante"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                    href={buildPaginationHref(content, pagination.page + 1)}
                >
                    <ChevronRight className="size-4" />
                </Link>
            ) : (
                <span
                    aria-disabled="true"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/10 bg-white/50 text-brand-navy/35"
                >
                    <ChevronRight className="size-4" />
                </span>
            )}
        </nav>
    );
}

function ProductResultCard({
    product,
}: {
    product: CatalogProduct;
}) {
    const cardProduct: FlashDealProduct = {
        id: product.id,
        image: product.image,
        name: product.title,
        originalPrice: product.originalPrice,
        platform: product.platform,
        platformImage: product.platformImage,
        platformSlug: product.platformSlug,
        price: product.price,
        slug: product.slug,
    };

    return (
        <FlashDealCard
            className="w-full max-w-none md:w-full lg:w-full"
            product={cardProduct}
        />
    );
}
