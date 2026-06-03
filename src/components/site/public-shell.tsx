"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isShelllessRoute = [
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/reinitialiser-mot-de-passe",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAdminRoute || isShelllessRoute) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen pt-10">{children}</div>
      <SiteFooter />
    </>
  );
}
