"use client";

import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/categories", label: "Catégories" },
  { href: "/produits", label: "Produits" },
  { href: "/#faq", label: "FAQ" },
  { href: "/panier", label: "Panier" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 max-w-screen h-10">
      <nav className="border-b border-brand-lavender/25 bg-brand-navy/88 backdrop-blur-2xl">
        <div className="mx-auto flex  max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <Link
            aria-label="Playsdepot TN"

            href="/"
          >
            <Image src="/logo_white.webp" alt="logo" width={100} height={100} className="" />
          </Link>

          <form
            action="/produits"
            className="hidden max-w-md flex-1 items-center overflow-hidden rounded-full border border-brand-ice/15  bg-[#0D0D22] transition focus-within:border-brand-lavender focus-within:shadow-[0_0_0_3px_rgba(185,152,241,0.12)] md:flex"
            method="get"
          >
            <input
              aria-label="Rechercher"
              className="min-w-0 flex-1 bg-[#0D0D22] px-4 py-2.5 text-sm text-brand-lilac outline-none placeholder:text-brand-periwinkle/60"
              name="search"
              placeholder="Chercher Steam, PSN, Free Fire..."
              type="search"
            />
            <button
              aria-label="Lancer la recherche"
              className="flex size-10 items-center justify-center text-brand-periwinkle transition hover:text-brand-lavender"
              type="submit"
            >
              <Search className="size-4" />
            </button>
          </form>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-periwinkle transition hover:bg-brand-lilac/8 hover:text-brand-lilac"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">

            <HeaderAction ariaLabel="Wishlist" badge="0" icon={Heart} />
            <HeaderAction
              ariaLabel="Panier"
              badge="0"
              href="/panier"
              icon={ShoppingCart}
            />
            <button
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="flex size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-lilac lg:hidden"
              onClick={() => setMobileMenuOpen((current) => !current)}
              type="button"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "border-t border-brand-ice/12 bg-brand-navy/96 px-4 py-4 lg:hidden",
            mobileMenuOpen ? "block" : "hidden",
          )}
        >
          <form
            action="/produits"
            className="mb-3 flex items-center overflow-hidden rounded-full border border-brand-ice/15 bg-brand-lilac/8"
            method="get"
          >
            <input
              aria-label="Rechercher"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-brand-lilac outline-none placeholder:text-brand-periwinkle/60"
              name="search"
              placeholder="Chercher un produit..."
              type="search"
            />
            <button
              aria-label="Lancer la recherche"
              className="flex size-10 items-center justify-center text-brand-periwinkle"
              type="submit"
            >
              <Search className="size-4" />
            </button>
          </form>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-xl px-4 py-3 text-sm font-semibold text-brand-periwinkle transition hover:bg-brand-lilac/8 hover:text-brand-lilac"
                href={item.href}
                key={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeaderAction({
  ariaLabel,
  badge,
  href,
  icon: Icon,
}: {
  ariaLabel: string;
  badge: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const className =
    "relative hidden size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender sm:flex";
  const content = (
    <>
      <Icon className="size-4" />
      <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
        {badge}
      </span>
    </>
  );

  if (href) {
    return (
      <Link aria-label={ariaLabel} className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-label={ariaLabel} className={className} type="button">
      {content}
    </button>
  );
}
