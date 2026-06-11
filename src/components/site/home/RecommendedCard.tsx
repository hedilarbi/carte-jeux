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
                "group relative z-0 h-[154px] w-[min(88vw,360px)] shrink-0 overflow-hidden rounded-xl border-2 border-[#A680F1] bg-[#0F0F28]/92 font-body font-extrabold leading-none text-white md:h-[500px] md:w-[240px] md:bg-transparent lg:h-[565px]",
                className,
            )}
        >
            <div className="relative grid h-full grid-cols-[116px_1fr] md:hidden">
                <Link
                    aria-label={`Voir le produit - ${product.name}`}
                    className="absolute inset-0 z-10"
                    href={productHref}
                />

                <div className="relative h-full overflow-hidden bg-[#0F0F28]">
                    <Image
                        alt={product.name}
                        className="object-cover"
                        fill
                        priority={product.id === 1}
                        sizes="116px"
                        src={product.image ?? "/jeu1.jpg"}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_58%,rgba(15,15,40,0.86)_100%)]" />
                </div>

                <div className="relative z-[2] flex min-w-0 flex-col p-3 pr-14">
                    <ProductPlatformBadge
                        action={
                            <FavoriteButton
                                aria-label={`Ajouter aux favoris - ${product.name}`}
                                activeClassName="bg-white text-danger"
                                className="flex size-7 items-center justify-center rounded-full bg-white/14 text-white transition hover:bg-white/24 hover:text-brand-lavender"
                                iconClassName="size-4"
                                productId={productId}
                                productSlug={product.slug}
                            />
                        }
                        className="mb-2 h-8 w-full max-w-full px-2.5 text-xs"
                        iconClassName="size-5"
                        image={product.platformImage}
                        name={product.platform}
                    />

                    <h3 className="line-clamp-2 font-heading text-[13px] font-black leading-5 text-white">
                        {product.name}
                    </h3>
                    <p className="mt-1 truncate font-body text-[11px] font-bold uppercase text-[#b3aac9]">
                        {product.platform} · Global
                    </p>
                    <p className="mt-auto font-heading text-xl font-black text-white">
                        {product.price}{" "}
                        <span className="font-mono text-[11px] text-[#b3aac9]">TND</span>
                    </p>
                </div>

                <AddToCartButton
                    aria-label={`Ajouter au panier - ${product.name}`}
                    className="absolute bottom-3 right-3 z-40 flex size-10 items-center justify-center rounded-xl bg-brand-lavender text-[#03030A] shadow-[0_6px_18px_rgba(185,152,241,0.35)] transition hover:bg-brand-blue-mist"
                    productId={productId}
                    productSlug={product.slug}
                >
                    <ShoppingCart className="size-4" />
                </AddToCartButton>
            </div>

            <div className="relative hidden h-full md:grid md:[grid-template-areas:'img']">
                <Link
                    aria-label={`Voir le produit - ${product.name}`}
                    className="absolute inset-0 z-10 cursor-pointer"
                    href={productHref}
                />

                <div className="relative h-full [grid-area:img]">

                    <div className="relative aspect-[625/873] w-full overflow-hidden bg-[#0F0F28] transition-[clip-path] duration-500 ease-out [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(0_0_112px_0)]">
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

                <div className="absolute inset-x-0 bottom-0 z-20 grid translate-y-[112px] transition-transform duration-500 ease-out [grid-template-areas:'flag'_'top'_'bottom'] group-hover:translate-y-0">
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
                        className="relative z-[2] h-[38px] px-[13px] text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [grid-area:flag]"
                        iconClassName="size-[27px]"
                        image={product.platformImage}
                        name={product.platform}
                    />
                    <Link
                        aria-label={`Voir le produit - ${product.name}`}
                        className="absolute inset-0 z-10"
                        href={productHref}
                        tabIndex={-1}
                    />

                    <div className="relative z-[2] grid bg-transparent px-4 pb-3 pt-4 [grid-area:top]">
                        <div className="min-w-0">
                            <h3 className="line-clamp-2 min-h-10 font-heading text-[13px] font-black leading-5 text-white">
                                {product.name}
                            </h3>
                            <p className="mt-2 truncate font-body text-xs font-bold uppercase text-[#b3aac9]">
                                {product.platform}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-20 flex flex-col justify-between bg-transparent px-4 pb-4 [grid-area:bottom]">
                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-body text-xs font-bold text-[#b3aac9]">
                                    À partir de
                                </p>
                                <p className="mt-1 font-heading text-3xl font-black text-white">
                                    {product.price}{" "}
                                    <span className="font-mono text-[15px] text-[#b3aac9]">
                                        TND
                                    </span>
                                </p>
                                {/* {product.originalPrice ? (
                                    <p className="mt-1 font-mono text-[11px] text-[#b3aac9]/70 line-through">
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

                        <div className="relative z-40 mt-4 grid gap-2">
                            <AddToCartButton
                                aria-label={`Ajouter au panier - ${product.name}`}
                                className="rounded-md bg-brand-lavender px-3 py-3 text-center text-xs font-black text-white transition hover:bg-brand-electric-blue"
                                productId={productId}
                                productSlug={product.slug}
                            >
                                Ajouter au panier
                            </AddToCartButton>
                            <Link
                                aria-label={`Voir le produit - ${product.name}`}
                                className="rounded-md border border-white/18 px-3 py-3 text-center text-xs font-black text-white transition hover:border-brand-lavender hover:text-brand-lavender"
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
