import Image from "next/image";
import { Heart } from "lucide-react";

const products = [
    {
        id: 1,
        image: "/jeu1.jpg",
        platform: "PlayStation Store",
        region: "Europe",
        title: "Carte PSN 10 EUR - Recharges PlayStation Store Europe",
        price: "38.500",
    },
    {
        id: 2,
        image: "/jeu1.jpg",
        platform: "PlayStation Plus",
        region: "Global",
        title: "PlayStation Plus Essential - 1 mois Abonnement PS4 / PS5",
        price: "28.900",
    },
    {
        id: 3,
        image: "/jeu1.jpg",
        platform: "Xbox Live",
        region: "Global",
        title: "Xbox Game Pass Ultimate - 1 Month Subscription Key",
        price: "24.900",
    },
    {
        id: 4,
        image: "/jeu1.jpg",
        platform: "PlayStation Store",
        region: "Europe",
        title: "Carte PSN 20 EUR - Code digital PlayStation Network",
        price: "72.900",
    },
    {
        id: 5,
        image: "/jeu1.jpg",
        platform: "PlayStation Store",
        region: "USA",
        title: "PSN Gift Card 25 USD - Compte PlayStation USA",
        price: "82.500",
    },
    {
        id: 6,
        image: "/jeu1.jpg",
        platform: "PlayStation Store",
        region: "Europe",
        title: "Carte PSN 50 EUR - Jeux PS4 / PS5 et extensions",
        price: "169.900",
    },
] as const;

export default function MainSection() {
    return (
        <section className="min-w-0 flex-1">
            <div className="relative h-[180px] overflow-hidden  border border-brand-ice/20 bg-brand-navy shadow-[0_18px_44px_rgba(1,45,105,0.22)] sm:h-[240px] lg:h-[284px]">
                <Image
                    alt="Catalogue de cartes PlayStation et recharges gaming"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 883px"
                    src="/banner_products.png"
                />
            </div>

            <div className="mt-8">
                <h1 className="font-heading text-2xl font-black leading-tight text-brand-dark sm:text-3xl">
                    Cartes PSN Tunisie - Recharges PlayStation & jeux PS4 / PS5
                </h1>

                <div className="mt-5 flex flex-col gap-4 rounded-[18px] border border-brand-ice/18 bg-white/72 p-4 shadow-[0_12px_34px_rgba(1,45,105,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-brand-navy/72">
                        Résultats trouvés :{" "}
                        <span className="text-brand-dark">3371</span>
                    </p>

                    <label className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-navy/10 bg-white px-4 py-3 text-sm font-semibold text-brand-dark md:w-auto">
                        <span className="shrink-0 font-mono text-xs uppercase text-brand-navy/55">
                            Popularité :
                        </span>
                        <select
                            className="min-w-0 bg-transparent font-semibold outline-none"
                            defaultValue="popular"
                        >
                            <option value="popular">Les plus populaires</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="new">Nouveautés</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(222px,1fr))] gap-6">
                {products.map((product) => (
                    <ProductResultCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

function ProductResultCard({
    product,
}: {
    product: (typeof products)[number];
}) {
    return (
        <article className="group flex h-[433px] w-full max-w-[224px] flex-col justify-self-center overflow-hidden rounded-[20px] border border-[#A582ED] bg-[#A582ED] shadow-[0_18px_38px_rgba(130,88,203,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(130,88,203,0.35)]">
            <div className="relative h-[220px] shrink-0 overflow-hidden rounded-t-[19px]">
                <Image
                    alt={product.title}
                    className="object-cover"
                    fill
                    sizes="222px"
                    src={product.image}
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
                <div className="flex h-[38px] shrink-0 items-center gap-2.5 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-[13px] text-base font-bold uppercase leading-3 text-white">
                    <Image
                        alt="xbox live"
                        className="size-[27px] brightness-0 invert"
                        height={27}
                        src="/xbox.png"
                        width={27}
                    />
                    <span className="truncate">Global</span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-between px-[15px] pb-[15px] pt-[15px]">
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
                        </div>

                        <button
                            className="mx-auto flex h-[35px] min-h-[35px] w-[192px] items-center justify-center rounded-lg bg-[#B0A4F5] px-[31.87px] py-2.5 text-xs font-extrabold text-white transition hover:bg-[#A582ED]"
                            type="button"
                        >
                            <span className="w-[128.25px] text-center leading-[15px]">
                                Ajouter au panier
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
