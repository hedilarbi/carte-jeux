import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import type { ProductPreview } from "@/components/site/home/home-data";
import { cn } from "@/lib/utils/cn";

export function RecommendedCard({
    className,
    product,
}: {
    className?: string;
    product: ProductPreview;
}) {
    return (
        <article
            className={cn(
                "group relative z-0 h-[154px] w-[min(88vw,360px)] shrink-0 overflow-hidden rounded-xl border-2 border-[#A680F1] bg-[#0F0F28]/92 font-extrabold leading-none text-white md:h-[480px] md:w-[240px] md:bg-transparent",
                className,
            )}
        >
            <div className="relative grid h-full grid-cols-[116px_1fr] md:hidden">
                <Link
                    aria-label={`Voir les offres - ${product.name}`}
                    className="absolute inset-0 z-[1]"
                    href="#products"
                />

                <div className="relative h-full overflow-hidden">
                    <Image
                        alt={product.name}
                        className="object-cover"
                        fill
                        priority={product.id === 1}
                        sizes="116px"
                        src="/jeu1.jpg"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_58%,rgba(15,15,40,0.86)_100%)]" />
                </div>

                <div className="relative z-[2] flex min-w-0 flex-col p-3 pr-14">
                    <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <Image src="/xbox.png" width={13} height={13} alt="xbox live" />
                        <span className="truncate">Xbox Live</span>
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-black leading-5 text-white">
                        {product.name}
                    </h3>
                    <p className="mt-1 truncate text-[11px] font-bold text-[#b3aac9]">
                        {product.platform} · Global
                    </p>
                    <p className="mt-auto font-heading text-xl font-black text-white">
                        {product.price}{" "}
                        <span className="font-mono text-[11px] text-[#b3aac9]">TND</span>
                    </p>
                </div>

                <button
                    aria-label={`Ajouter au panier - ${product.name}`}
                    className="absolute bottom-3 right-3 z-20 flex size-10 items-center justify-center rounded-xl bg-brand-lavender text-[#03030A] shadow-[0_6px_18px_rgba(185,152,241,0.35)] transition hover:bg-brand-blue-mist"
                    type="button"
                >
                    <ShoppingCart className="size-4" />
                </button>
            </div>

            <div className="relative hidden h-full md:grid md:[grid-template-areas:'img']">
                <Link
                    aria-label={`Voir les offres - ${product.name}`}
                    className="absolute inset-0 z-[1] cursor-pointer"
                    href="#products"
                />

                <div className="relative h-full [grid-area:img]">

                    <div className="relative h-[308px] overflow-hidden transition-[clip-path] duration-500 ease-out [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(0_0_112px_0)]">
                        <Image
                            alt={product.name}
                            className="object-cover transition duration-500 "
                            fill
                            priority={product.id === 1}
                            sizes="(max-width: 768px) 190px, 230px"
                            src="/jeu1.jpg"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#1f0a4d,rgba(31,10,77,0))]" />
                    </div>

                </div>

                <div className="absolute inset-x-0 bottom-0 z-20 grid translate-y-[112px] transition-transform duration-500 ease-out [grid-template-areas:'flag'_'top'_'bottom'] group-hover:translate-y-0">
                    <div className="relative z-[2] border-y border-white/10 bg-black/10 px-4 py-2 text-center text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md [grid-area:flag]">
                        <div className="flex justify-center gap-2 items-center">
                            <Image src='/xbox.png' width={15} height={15} alt='xbox live' />
                            <p>Xbox Live</p>
                        </div>
                    </div>
                    <Link
                        aria-label={`Voir les offres - ${product.name}`}
                        className="absolute inset-0 z-[1]"
                        href="#products"
                        tabIndex={-1}
                    />

                    <div className="relative z-[2] grid bg-transparent px-4 pb-3 pt-4 [grid-area:top]">
                        <div className="min-w-0">
                            <h3 className="line-clamp-2 min-h-10 text-[13px] font-black leading-5 text-white">
                                {product.name}
                            </h3>
                            <p className="mt-2 truncate text-xs font-bold text-[#b3aac9]">
                                Global
                            </p>
                        </div>
                    </div>

                    <div className="relative z-[2] flex flex-col justify-between bg-transparent px-4 pb-4 [grid-area:bottom]">
                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[#b3aac9]">
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

                        <div className="relative z-[2] mt-4 grid gap-2">
                            <button
                                aria-label={`Ajouter au panier - ${product.name}`}
                                className="rounded-md bg-brand-lavender px-3 py-3 text-center text-xs font-black text-white transition hover:bg-brand-electric-blue"
                                type="button"
                            >
                                Ajouter au panier
                            </button>
                            <Link
                                aria-label={`Voir les offres - ${product.name}`}
                                className="rounded-md border border-white/18 px-3 py-3 text-center text-xs font-black text-white transition hover:border-brand-lavender hover:text-brand-lavender"
                                href="#products"
                            >
                                Voir les offres
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
