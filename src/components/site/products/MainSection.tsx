import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import {
    FlashDealCard,
    type FlashDealProduct,
} from "@/components/site/home/flash-deals-carousel";
import { ProductSortSelect } from "@/components/site/products/ProductSortSelect";
import { buildPaginatedHref } from "@/lib/utils/catalog-links";
import type { CatalogPageContent, CatalogProduct } from "@/types/catalog";

interface MainSectionProps {
    content: CatalogPageContent;
    mobileFilters?: ReactNode;
    // When set, page links are intercepted and loaded client-side (filtered listing).
    onPageChange?: (page: number) => void;
    onSortChange?: (sort: string) => void;
    paginationBasePath: string;
    // Category pages render their own H1: the listing title must not be a second one.
    titleAs?: "h1" | "p";
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

// Besides the neighbours, link pages 10, 100 and 1000 away: with only
// previous/next, page 800 of a category would sit ~800 clicks deep for crawlers.
const PAGINATION_JUMPS = [10, 100, 1000];

function getPaginationPages(currentPage: number, totalPages: number) {
    const pages = new Set([1, totalPages]);

    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
        pages.add(page);
    }

    for (const jump of PAGINATION_JUMPS) {
        pages.add(currentPage - jump);
        pages.add(currentPage + jump);
    }

    return Array.from(pages)
        .filter((page) => page > 0 && page <= totalPages)
        .sort((first, second) => first - second);
}

export default function MainSection({ content, mobileFilters, onPageChange, onSortChange, paginationBasePath, titleAs: TitleTag = "h1" }: MainSectionProps) {
    const title = resolvePageTitle(content);

    return (
        <section className="min-w-0 flex-1">
            <Link
                aria-label="Précommander GTA VI"
                className="relative block h-[140px] overflow-hidden border border-brand-ice/20 bg-brand-navy shadow-[0_18px_44px_rgba(1,45,105,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(1,45,105,0.28)] sm:h-[320px] lg:h-[420px]"
                href="/precommande-gta-vi"
            >
                <Image
                    alt="Catalogue de cartes et recharges gaming"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 883px"
                    src="/banner-tga6.jpg"
                />
            </Link>

            <div className="mt-8">
                <TitleTag className="font-heading text-lg font-black leading-tight text-brand-dark sm:text-3xl">
                    {title}
                </TitleTag>

                {mobileFilters}

                <div className="mt-5 flex flex-col gap-4 rounded-[18px] border border-brand-ice/18 bg-white/72 p-4 shadow-[0_12px_34px_rgba(1,45,105,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-brand-navy/72">
                        Résultats trouvés :{" "}
                        <span className="text-brand-dark">{content.totalItems}</span>
                    </p>

                    <div className="hidden w-full items-center justify-between gap-3 rounded-xl border border-brand-navy/10 bg-white px-4 py-3 text-sm font-semibold text-brand-dark md:flex md:w-auto">
                        <span className="shrink-0 font-mono text-xs uppercase text-brand-navy/55">
                            Popularité :
                        </span>
                        <ProductSortSelect selected={content.selected} onSortChange={onSortChange} />
                    </div>
                </div>
            </div>

            {content.products.length > 0 ? (
                <>
                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] md:gap-6">
                        {content.products.map((product) => (
                            <ProductResultCard key={product.id} product={product} />
                        ))}
                    </div>
                    <CatalogPagination
                        basePath={paginationBasePath}
                        content={content}
                        onPageChange={onPageChange}
                    />
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

function CatalogPagination({
    basePath,
    content,
    onPageChange,
}: {
    basePath: string;
    content: CatalogPageContent;
    onPageChange?: (page: number) => void;
}) {
    const { pagination } = content;

    if (pagination.totalPages <= 1) {
        return null;
    }

    const pages = getPaginationPages(pagination.page, pagination.totalPages);
    // Real <a href> links, present in the server HTML, so crawlers and users
    // without JavaScript can walk the whole catalogue.
    const linkProps = (page: number) => ({
        href: buildPaginatedHref(basePath, page),
        onClick: onPageChange
            ? (event: MouseEvent<HTMLAnchorElement>) => {
                  event.preventDefault();
                  onPageChange(page);
              }
            : undefined,
        // Up to ~13 links per page: prefetching them all would render as many
        // catalogue pages on the server for every visitor.
        prefetch: false,
    });

    return (
        <nav
            aria-label="Pagination des produits"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
            {pagination.hasPreviousPage ? (
                <Link
                    {...linkProps(pagination.page - 1)}
                    aria-label="Page précédente"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                    rel="prev"
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
                            className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-brand-lavender px-2 text-sm font-black text-[#03030A]"
                        >
                            {page}
                        </span>
                    ) : (
                        <Link
                            {...linkProps(page)}
                            className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white px-2 text-sm font-bold text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                        >
                            {page}
                        </Link>
                    )}
                </span>
            ))}

            {pagination.hasNextPage ? (
                <Link
                    {...linkProps(pagination.page + 1)}
                    aria-label="Page suivante"
                    className="flex size-10 items-center justify-center rounded-lg border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-lavender hover:bg-brand-lavender"
                    rel="next"
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
        rawOriginalPrice: product.rawOriginalPrice,
        platform: product.platform,
        platformImage: product.platformImage,
        platformSlug: product.platformSlug,
        price: product.price,
        rawPrice: product.rawPrice,
        slug: product.slug,
    };

    return (
        <FlashDealCard
            className="w-full max-w-none md:w-full lg:w-full"
            product={cardProduct}
        />
    );
}
