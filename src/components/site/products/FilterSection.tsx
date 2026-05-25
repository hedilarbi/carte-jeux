import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

const types = ["Jeux", "Cartes cadeau", "Abonnements", "Recharges"];
const platforms = ["Steam", "PlayStation", "Xbox", "Nintendo"];
const genres = ["Action", "Aventure", "RPG", "Sport", "Simulation"];
const regions = ["Global", "Europe", "USA", "Tunisie"];

export default function FilterSection() {
    return (
        <aside className="w-[285px] shrink-0  bg-[#064FB1] p-5 text-white shadow-[0_18px_48px_rgba(1,45,105,0.28)]">
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

            <label className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#0F0F28]/55 px-3">
                <Search className="size-4 shrink-0 text-brand-lilac/70" />
                <input
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                    placeholder="Rechercher..."
                    type="search"
                />
            </label>

            <FilterGroup title="Type" values={types} />
            <FilterGroup title="Plateforme" values={platforms} />
            <FilterGroup title="Genre" values={genres} />

            <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-mono text-[14px] font-bold uppercase tracking-[0.12em] text-brand-lilac/70">
                    Région
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {regions.map((region) => (
                        <label
                            className="inline-flex cursor-pointer items-center rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/86 transition hover:border-brand-lavender/45"
                            key={region}
                        >
                            {region}
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-mono text-[14px] font-bold uppercase tracking-[0.12em] text-brand-lilac/70">
                    Prix
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                        className="h-10 min-w-0 rounded-lg border border-white/12 bg-[#0F0F28]/55 px-3 font-mono text-xs text-white outline-none placeholder:text-white/45"
                        placeholder="Min"
                        type="number"
                    />
                    <input
                        className="h-10 min-w-0 rounded-lg border border-white/12 bg-[#0F0F28]/55 px-3 font-mono text-xs text-white outline-none placeholder:text-white/45"
                        placeholder="Max"
                        type="number"
                    />
                </div>
            </div>
        </aside>
    );
}

function FilterGroup({
    title,
    values,
}: {
    title: string;
    values: string[];
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
                {values.map((value) => (
                    <label
                        className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/86"
                        key={value}
                    >
                        <input
                            className="size-4 accent-brand-lavender"
                            type="checkbox"
                        />
                        <span>{value}</span>
                    </label>
                ))}
            </div>
        </details>
    );
}
