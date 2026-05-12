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
  User,
  X,
} from "lucide-react";
import { BiSolidZap } from "react-icons/bi";
import { FaLock } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoGift } from "react-icons/io5";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/#categories", label: "Catégories" },
  { href: "/#products", label: "Produits" },
  { href: "/admin", label: "Admin" },
];

const announcementItems = [
  { icon: BiSolidZap, label: "Livraison instantanée 24/7" },
  { icon: FaLock, label: "Paiement 100% sécurisé" },
  { icon: IoGameController, label: "+500 produits" },
  { icon: IoLogoWhatsapp, label: "Support WhatsApp" },
  { icon: IoGift, label: "Code promo: GAMER15" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 max-w-screen">
      <div className="flex h-9 items-center overflow-hidden bg-[linear-gradient(90deg,var(--brand-lilac-soft),var(--brand-ice),var(--brand-electric-blue),var(--brand-violet-mist))] bg-[length:300%_100%] ">
        <div className="flex w-max max-w-none animate-[announcement-marquee_24s_linear_infinite] items-center md:mx-auto md:w-full md:max-w-[1400px] md:animate-none md:justify-center motion-reduce:animate-none">
          <AnnouncementGroup />
          <AnnouncementGroup isDuplicate />
        </div>
      </div>

      <nav className="border-b border-brand-lavender/25 bg-brand-navy/88 backdrop-blur-2xl">
        <div className="mx-auto flex  max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <Link
            aria-label="Playsdepot TN"

            href="/"
          >
            <Image src="/logo.png" alt="logo" width={100} height={100} className="" />
          </Link>

          <form className="hidden max-w-md flex-1 items-center overflow-hidden rounded-full border border-brand-ice/15  bg-[#0D0D22] transition focus-within:border-brand-lavender focus-within:shadow-[0_0_0_3px_rgba(185,152,241,0.12)] md:flex">
            <input
              aria-label="Rechercher"
              className="min-w-0 flex-1 bg-[#0D0D22] px-4 py-2.5 text-sm text-brand-lilac outline-none placeholder:text-brand-periwinkle/60"
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
            <HeaderAction ariaLabel="Panier" badge="0" icon={ShoppingCart} />
            <Link
              aria-label="Compte"
              className="hidden size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender sm:flex"
              href="/admin"
            >
              <User className="size-4" />
            </Link>
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
          <form className="mb-3 flex items-center overflow-hidden rounded-full border border-brand-ice/15 bg-brand-lilac/8">
            <input
              aria-label="Rechercher"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-brand-lilac outline-none placeholder:text-brand-periwinkle/60"
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

function AnnouncementGroup({ isDuplicate = false }: { isDuplicate?: boolean }) {
  return (
    <div
      aria-hidden={isDuplicate || undefined}
      className={cn(
        "flex shrink-0 items-center gap-6 whitespace-nowrap px-4 font-mono text-[11px] font-bold uppercase text-black",
        "md:w-full md:shrink md:justify-center",
        isDuplicate && "md:hidden",
      )}
    >
      {announcementItems.map((item, index) => (
        <div className="contents" key={`${item.label}-${isDuplicate ? "copy" : "main"}`}>
          {index > 0 ? (
            <span className="size-1 rounded-full bg-brand-navy/45" />
          ) : null}
          <span className="inline-flex items-center gap-2">
            <item.icon className="size-3.5" />
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function HeaderAction({
  ariaLabel,
  badge,
  icon: Icon,
}: {
  ariaLabel: string;
  badge: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="relative hidden size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender sm:flex"
      type="button"
    >
      <Icon className="size-4" />
      <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
        {badge}
      </span>
    </button>
  );
}
