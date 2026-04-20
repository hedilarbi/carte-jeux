"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package2,
  PanelsTopLeft,
  Percent,
  ShoppingCart,
  SmartphoneCharging,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { AdminSession } from "@/types/entities";

interface AdminShellProps {
  session: AdminSession;
  children: React.ReactNode;
}

const navigation = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package2 },
  { href: "/admin/categories", label: "Catégories", icon: PanelsTopLeft },
  { href: "/admin/platforms", label: "Plateformes", icon: SmartphoneCharging },
  { href: "/admin/regions", label: "Régions", icon: PanelsTopLeft },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/promos", label: "Promotions", icon: Percent },
];

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="admin-grid min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(103,208,255,0.12),_transparent_38%)]" />

      {sidebarOpen ? (
        <button
          aria-label="Fermer le voile de la barre latérale"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/90 p-5 backdrop-blur-xl transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="block">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">
              Playsdepot Admin
            </p>
          </Link>
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-sky-400/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
