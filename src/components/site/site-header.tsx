"use client";

import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHeaderCounters } from "@/components/site/site-header-counters";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/categories", label: "Catégories" },
  { href: "/produits", label: "Produits" },
  { href: "/#faq", label: "FAQ" },
];

type HeaderUser = {
  email: string;
};

export function SiteHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const { cartCount, favoriteCount } = useHeaderCounters();

  async function refreshUser() {
    try {
      const response = await fetch("/api/auth/me");
      const payload = await response.json();

      setUser(payload?.success ? payload.data.user : null);
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      setMobileMenuOpen(false);
      window.dispatchEvent(
        new CustomEvent("auth:updated", {
          detail: { user: null },
        }),
      );
      router.push("/connexion");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshUser();
    });

    function handleAuthUpdate(event: Event) {
      const customEvent = event as CustomEvent<{ user: HeaderUser | null }>;
      setUser(customEvent.detail.user);
    }

    window.addEventListener("auth:updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("auth:updated", handleAuthUpdate);
    };
  }, []);

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

            <HeaderAction
              ariaLabel="Favoris"
              badge={String(favoriteCount)}
              href="/favoris"
              icon={Heart}
            />
            <HeaderAction
              ariaLabel="Panier"
              badge={String(cartCount)}
              href="/panier"
              icon={ShoppingCart}
            />
            {user ? (
              <ProfileDropdown
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
                user={user}
              />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  className="rounded-xl border border-brand-ice/15 bg-brand-lilac/8 px-3 py-2 text-xs font-black uppercase text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender"
                  href="/connexion"
                >
                  Connexion
                </Link>
                <Link
                  className="rounded-xl bg-brand-lavender px-3 py-2 text-xs font-black uppercase text-[#03030A] transition hover:bg-brand-blue-mist"
                  href="/inscription"
                >
                  Inscription
                </Link>
              </div>
            )}
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
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-brand-ice/12 pt-3">
              {user ? (
                <>
                  <Link
                    className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-brand-periwinkle transition hover:bg-brand-lilac/8 hover:text-brand-lilac"
                    href="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    className="rounded-xl border border-brand-ice/15 px-4 py-3 text-center text-sm font-black uppercase text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender disabled:cursor-wait disabled:opacity-60"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    type="button"
                  >
                    {isLoggingOut ? "..." : "Déconnexion"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="rounded-xl border border-brand-ice/15 px-4 py-3 text-center text-sm font-black uppercase text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender"
                    href="/connexion"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    className="rounded-xl bg-brand-lavender px-4 py-3 text-center text-sm font-black uppercase text-[#03030A] transition hover:bg-brand-blue-mist"
                    href="/inscription"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
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
  badge?: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const className =
    "relative flex size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender";
  const content = (
    <>
      <Icon className="size-4" />
      {badge ? (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
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

function ProfileDropdown({
  isLoggingOut,
  onLogout,
  user,
}: {
  isLoggingOut: boolean;
  onLogout: () => void;
  user: HeaderUser;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Profil - ${user.email}`}
        className="relative flex size-10 items-center justify-center rounded-xl border border-brand-ice/15 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <UserRound className="size-4" />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[210px] rounded-2xl border border-brand-ice/15 bg-[#0D0D22] p-2 shadow-[0_18px_42px_rgba(0,0,0,0.32)]"
          role="menu"
        >
          <p className="truncate px-3 pb-2 pt-1 font-inter text-xs font-semibold text-brand-periwinkle/70">
            {user.email}
          </p>
          <Link
            className="flex h-11 items-center gap-2 rounded-xl px-3 font-inter text-sm font-bold text-brand-periwinkle transition hover:bg-brand-lilac/8 hover:text-brand-lilac"
            href="/profil"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <UserRound className="size-4" />
            Profil
          </Link>
          <button
            className="mt-1 flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-inter text-sm font-bold text-brand-periwinkle transition hover:bg-brand-lilac/8 hover:text-brand-lilac disabled:cursor-wait disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={onLogout}
            role="menuitem"
            type="button"
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
