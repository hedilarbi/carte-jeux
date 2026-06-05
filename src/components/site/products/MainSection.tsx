import Image from "next/image";

import {
    FlashDealCard,
    type FlashDealProduct,
} from "@/components/site/home/flash-deals-carousel";
import type { CatalogPageContent, CatalogProduct } from "@/types/catalog";

interface MainSectionProps {
    content: CatalogPageContent;
}

function addHiddenInputs(content: CatalogPageContent) {
    const { selected } = content;

    return (
        <>
            {selected.types.map((type) => (
                <input key={`type-${type}`} name="type" type="hidden" value={type} />
            ))}
            {selected.platforms.map((platform) => (
                <input
                    key={`platform-${platform}`}
                    name="platform"
                    type="hidden"
                    value={platform}
                />
            ))}
            {selected.regions.map((region) => (
                <input
                    key={`region-${region}`}
                    name="region"
                    type="hidden"
                    value={region}
                />
            ))}
            {selected.search ? (
                <input name="search" type="hidden" value={selected.search} />
            ) : null}
            {selected.min ? <input name="min" type="hidden" value={selected.min} /> : null}
            {selected.max ? <input name="max" type="hidden" value={selected.max} /> : null}
        </>
    );
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

export default function MainSection({ content }: MainSectionProps) {
    const title = resolvePageTitle(content);

    return (
        <section className="min-w-0 flex-1">
            <div className="relative h-[180px] overflow-hidden border border-brand-ice/20 bg-brand-navy shadow-[0_18px_44px_rgba(1,45,105,0.22)] sm:h-[240px] lg:h-[284px]">
                <Image
                    alt="Catalogue de cartes et recharges gaming"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 883px"
                    src="/banner_products.png"
                />
            </div>

            <div className="mt-8">
                <h1 className="font-heading text-2xl font-black leading-tight text-brand-dark sm:text-3xl">
                    {title}
                </h1>

                <div className="mt-5 flex flex-col gap-4 rounded-[18px] border border-brand-ice/18 bg-white/72 p-4 shadow-[0_12px_34px_rgba(1,45,105,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-brand-navy/72">
                        Résultats trouvés :{" "}
                        <span className="text-brand-dark">{content.totalItems}</span>
                    </p>

                    <form
                        action="/produits"
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-navy/10 bg-white px-4 py-3 text-sm font-semibold text-brand-dark md:w-auto"
                        method="get"
                    >
                        {addHiddenInputs(content)}
                        <span className="shrink-0 font-mono text-xs uppercase text-brand-navy/55">
                            Popularité :
                        </span>
                        <select
                            className="min-w-0 bg-transparent font-semibold outline-none"
                            defaultValue={content.selected.sort}
                            name="sort"
                        >
                            <option value="popular">Les plus populaires</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="new">Nouveautés</option>
                        </select>
                        <button
                            className="rounded-lg bg-brand-lavender px-3 py-2 text-xs font-black text-[#03030A]"
                            type="submit"
                        >
                            OK
                        </button>
                    </form>
                </div>
            </div>

            {content.products.length > 0 ? (
                <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                    {content.products.map((product) => (
                        <ProductResultCard key={product.id} product={product} />
                    ))}
                </div>
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
