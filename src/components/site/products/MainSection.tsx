import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

import { ProductPlatformBadge } from "@/components/site/product-platform-badge";
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
    return (
        <article className="group flex min-h-[508px] w-full flex-col overflow-hidden rounded-[20px] border border-[#A582ED] bg-[#A582ED] shadow-[0_18px_38px_rgba(130,88,203,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(130,88,203,0.35)]">
            <div className="relative h-[255px] shrink-0 overflow-hidden rounded-t-[19px]">
                <Image
                    alt={product.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    src={product.image ?? "/jeu1.jpg"}
                />

                <button
                    aria-label={`Ajouter ${product.title} aux favoris`}
                    className="absolute right-[11px] top-px z-20 flex h-16 w-12 translate-y-[-6px] items-start justify-center rounded-b-[18px] bg-black/10 pt-4 text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100"
                    type="button"
                >
                    <Heart className="size-5" />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-white text-brand-dark">
                <ProductPlatformBadge
                    className="h-[38px] shrink-0 px-[13px] text-base"
                    iconClassName="size-[27px]"
                    image={product.platformImage}
                    name={product.platform}
                />

                <div className="flex min-h-0 flex-1 flex-col justify-between gap-5 px-[15px] pb-[15px] pt-[15px]">
                    <div>
                        <h2 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#1F0A4D]">
                            {product.title}
                        </h2>
                        <p className="mt-2 w-fit rounded-md bg-[#E7DAFF] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#8258CB]">
                            {product.region}
                        </p>
                    </div>

                    <div>
                        <div className="mb-[15px]">
                            <p className="text-[11px] font-semibold text-[#6F6288]">
                                À partir de
                            </p>
                            <p className="font-heading text-lg font-black text-[#1F0A4D]">
                                {product.price}{" "}
                                <span className="font-mono text-[11px] text-[#6F6288]">
                                    TND
                                </span>
                            </p>
                            {product.originalPrice ? (
                                <p className="font-mono text-[11px] text-[#6F6288]/70 line-through">
                                    {product.originalPrice} TND
                                </p>
                            ) : null}
                        </div>

                        <button
                            className="flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#B0A4F5] px-4 text-xs font-extrabold text-white transition hover:bg-[#A582ED]"
                            type="button"
                        >
                            <ShoppingCart className="size-4 shrink-0" />
                            <span className="whitespace-nowrap leading-[15px]">
                                Ajouter au panier
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
