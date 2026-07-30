import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { buildProductsHref } from "@/lib/utils/catalog-links";
import { AddToCartButton } from "@/components/site/add-to-cart-button";
import { FavoriteButton } from "@/components/site/favorites/favorite-button";
import { ProductPlatformBadge } from "@/components/site/product-platform-badge";
import type { ProductPreview } from "@/types/home";

export function RecommendedCard({
    categorySlug,
    className,
    product,
}: {
    categorySlug?: string;
    className?: string;
    product: ProductPreview;
}) {
    const productHref = product.slug
        ? `/produits/${product.slug}`
        : buildProductsHref(categorySlug ?? product.platformSlug);
    const productId = typeof product.id === "string" ? product.id : undefined;

    return (
        <article
            className={cn(
                "group relative z-0 aspect-[5/9] h-auto w-full shrink-0 overflow-hidden rounded-xl border-2 border-[#A680F1] bg-[#0F0F28]/92 font-body font-extrabold leading-none text-white md:aspect-auto md:h-[500px] md:w-[240px] md:bg-transparent lg:h-[565px]",
                className,
            )}
        >
            <div className="hidden">
                <Link
                    aria-label={`Voir le produit - ${product.name}`}
                    className="absolute inset-0 z-10"
                    href={productHref}
                />

                <ProductPlatformBadge
                    action={
                        <FavoriteButton
                            aria-label={`Ajouter aux favoris - ${product.name}`}
                            activeClassName="bg-white text-danger"
                            className="pointer-events-auto flex size-6 items-center justify-center rounded-full bg-white/14 text-white transition hover:bg-white/24 hover:text-brand-lavender"
                            iconClassName="size-3.5"
                            productId={productId}
                            productSlug={product.slug}
                        />
                    }
                    className="pointer-events-none absolute left-[104px] right-0 top-0 z-30 h-7 px-2 text-[10px] min-[376px]:left-[116px]"
                    iconClassName="size-4"
                    image={product.platformImage}
                    name={product.platform}
                />

                <div className="relative h-full overflow-hidden bg-[#0F0F28]">
                    <Image
                        alt={product.name}
                        className="object-cover"
                        fill
                        priority={product.id === 1}
                        sizes="(max-width: 375px) 104px, 116px"
                        src={product.image ?? "/jeu1.jpg"}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_58%,rgba(15,15,40,0.86)_100%)]" />
                </div>

                <div className="relative z-[2] flex min-w-0 flex-col p-2.5 pr-12 pt-10">
                    <h3 className="line-clamp-2 font-body text-[11px] font-black leading-4 text-white min-[376px]:text-xs min-[376px]:leading-[18px]">
                        {product.name}
                    </h3>
                    <p className="mt-1 truncate font-body text-[9px] font-bold uppercase text-[#b3aac9] min-[376px]:text-[10px]">
                        {product.platform} · {product.region ?? "Global"}
                    </p>
                    <p className="mt-auto font-body text-lg font-black text-red-500 min-[376px]:text-xl">
                        {product.price}{" "}
                        <span className="font-body text-[10px] text-red-300">
                            TND
                        </span>
                    </p>
                </div>

                <AddToCartButton
                    aria-label={`Ajouter au panier - ${product.name}`}
                    className="absolute bottom-2.5 right-2.5 z-40 flex size-9 items-center justify-center rounded-xl bg-brand-lavender text-[#03030A] shadow-[0_6px_18px_rgba(185,152,241,0.35)] transition hover:bg-brand-blue-mist"
                    productId={productId}
                    productSlug={product.slug}
                >
                    <ShoppingCart className="size-4" />
                </AddToCartButton>
            </div>

            <div className="relative grid h-full [grid-template-areas:'img']">
                <Link
                    aria-label={`Voir le produit - ${product.name}`}
                    className="absolute inset-0 z-50 cursor-pointer md:z-10"
                    href={productHref}
                />

                <div className="relative h-full [grid-area:img]">

                    <div className="relative aspect-[625/873] w-full overflow-hidden bg-[#0F0F28] transition-[clip-path] duration-500 ease-out [clip-path:inset(0_0_0_0)] md:group-hover:[clip-path:inset(0_0_112px_0)]">
                        <Image
                            alt={product.name}
                            className="object-cover transition duration-500"
                            fill
                            priority={product.id === 1}
                            sizes="(max-width: 768px) 190px, (max-width: 1024px) 230px, 25vw"
                            src={product.image ?? "/jeu1.jpg"}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#1f0a4d,rgba(31,10,77,0))]" />
                    </div>

                </div>

                <div className="absolute inset-x-0 bottom-0 z-20 grid translate-y-0 transition-transform duration-500 ease-out [grid-template-areas:'flag'_'top'_'bottom'] md:translate-y-[112px] md:group-hover:translate-y-0">
                    <ProductPlatformBadge
                        action={
                            <FavoriteButton
                                aria-label={`Ajouter aux favoris - ${product.name}`}
                                activeClassName="bg-white text-danger"
                                className="flex size-8 items-center justify-center rounded-full bg-white/14 text-white transition hover:bg-white/24 hover:text-brand-lavender"
                                iconClassName="size-4"
                                productId={productId}
                                productSlug={product.slug}
                            />
                        }
                        className="relative z-[2] h-7 px-2 text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [grid-area:flag] md:h-[38px] md:px-[13px] md:text-base"
                        iconClassName="size-4 md:size-[27px]"
                        image={product.platformImage}
                        name={product.platform}
                    />
                    <Link
                        aria-label={`Voir le produit - ${product.name}`}
                        className="absolute inset-0 z-10"
                        href={productHref}
                        tabIndex={-1}
                    />

                    <div className="relative z-[2] grid bg-[#0F0F28]/95 px-3 pb-2 pt-3 [grid-area:top] md:px-4 md:pb-3 md:pt-4">
                        <div className="min-w-0">
                            <h3 className="line-clamp-2 min-h-8 font-body text-[10px] font-black leading-4 text-white md:min-h-10 md:text-[13px] md:leading-5">
                                {product.name}
                            </h3>
                            <p className="mt-1 truncate font-body text-[9px] font-bold uppercase text-[#b3aac9] md:mt-2 md:text-xs">
                                {product.platform}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-20 flex flex-col justify-between bg-[#0F0F28]/95 px-3 pb-3 [grid-area:bottom] md:px-4 md:pb-4">
                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-body text-[9px] font-bold text-[#b3aac9] md:text-xs">
                                    À partir de
                                </p>
                                <p className="mt-1 font-body text-base font-black text-red-500 md:text-3xl">
                                    {product.price}{" "}
                                    <span className="font-body text-[10px] text-red-300 md:text-[15px]">
                                        TND
                                    </span>
                                </p>
                                {/* {product.originalPrice ? (
                                    <p className="mt-1 font-body text-[11px] text-white line-through">
                                        {product.originalPrice} TND
                                    </p>
                                ) : null} */}
                            </div>
                            {/* 
                            <button
                                aria-label={`Ajouter au panier - ${product.name}`}
                                className="relative z-[2] flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-lavender text-white transition hover:bg-brand-electric-blue md:group-hover:opacity-0 md:group-hover:pointer-events-none"
                                type="button"
                            >
                                <Plus className="size-4" />
                                <ShoppingCart className="size-4" />
                            </button> */}
                        </div>

                        <div className="relative z-40 mt-4 hidden gap-2 md:grid">
                            <AddToCartButton
                                aria-label={`Ajouter au panier - ${product.name}`}
                                className="rounded-md bg-brand-lavender px-2 py-2.5 text-center font-body text-[10px] font-black text-white transition hover:bg-brand-electric-blue md:px-3 md:py-3 md:text-xs"
                                productId={productId}
                                productSlug={product.slug}
                            >
                                Ajouter au panier
                            </AddToCartButton>
                            <Link
                                aria-label={`Voir le produit - ${product.name}`}
                                className="rounded-md border border-white/18 px-2 py-2.5 text-center font-body text-[10px] font-black text-white transition hover:border-brand-lavender hover:text-brand-lavender md:px-3 md:py-3 md:text-xs"
                                href={productHref}
                            >
                                Voir le produit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* <button
                aria-label={`Ajouter à la liste - ${product.name}`}
                className="absolute right-3 top-0 z-30 flex h-14 w-9 items-start justify-center bg-brand-lavender pt-2 text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition hover:bg-danger [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]"
                type="button"
            >
                <Heart className="size-4" />
            </button> */}
        </article>
    );
}
