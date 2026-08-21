"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CheckCircle2, X } from "lucide-react";

export function AddedToCartModal({
  onClose,
  productName,
}: {
  onClose: () => void;
  productName?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        aria-label="Fermer la confirmation"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <section
        aria-modal="true"
        aria-labelledby="added-to-cart-title"
        className="relative w-full max-w-md rounded-[24px] border border-white/15 bg-[#0F0F28] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.36)]"
        role="dialog"
      >
        <button
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-brand-periwinkle transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lavender"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <X className="size-4" />
        </button>

        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 className="size-8" />
        </div>

        <h3
          className="mt-5 font-heading text-xl font-bold text-brand-lilac"
          id="added-to-cart-title"
        >
          Ajouté au panier
        </h3>

        <p className="mt-3 text-sm leading-6 text-brand-periwinkle">
          {productName ? (
            <>
              <span className="font-bold text-white">{productName}</span> est
              maintenant dans votre panier.
            </>
          ) : (
            "Le produit est maintenant dans votre panier."
          )}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex h-12 items-center justify-center rounded-[11px] border border-white/18 px-5 font-body text-sm font-bold text-white transition hover:border-brand-lavender hover:text-brand-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lavender"
            onClick={onClose}
            type="button"
          >
            Continuer mes achats
          </button>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-5 font-body text-sm font-bold text-[#03030A] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lavender"
            href="/panier"
            onClick={onClose}
          >
            Voir le panier
          </Link>
        </div>
      </section>
    </div>
  );
}
