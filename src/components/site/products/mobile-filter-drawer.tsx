"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { ProductSortSelect } from "@/components/site/products/ProductSortSelect";
import type { CatalogSelectedFilters } from "@/types/catalog";

export function MobileFilterDrawer({
  children,
  selected,
}: {
  children: ReactNode;
  selected: CatalogSelectedFilters;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="mt-4 lg:hidden">
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-4 font-heading text-xs font-bold uppercase text-[#03030A] shadow-[0_8px_20px_rgba(1,45,105,0.14)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <SlidersHorizontal className="size-4" />
        Trier et filtrer
      </button>

      <button
        aria-label="Fermer les filtres"
        className={`fixed inset-0 z-[80] bg-[#00061E]/65 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />

      <section
        aria-label="Trier et filtrer les produits"
        aria-hidden={!isOpen}
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-[90] flex w-[min(88vw,360px)] flex-col bg-[#064FB1] text-white shadow-[18px_0_48px_rgba(0,6,30,0.38)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        inert={!isOpen}
        role="dialog"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-base font-bold">Trier et filtrer</h2>
          <button
            aria-label="Fermer"
            className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
          <div className="mx-5 mt-5 rounded-xl border border-white/12 bg-[#0F0F28]/55 px-4 py-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-brand-lilac/70">
              Trier par
            </p>
            <div className="mt-2 text-sm text-white">
              <ProductSortSelect selected={selected} />
            </div>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
