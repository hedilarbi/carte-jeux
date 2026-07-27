import Link from "next/link";
import type { ComponentType } from "react";
import {
  ShieldCheck,
  Zap,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import Image from "next/image";

const footerColumns = [
  {
    links: [
      { href: "/", label: "Accueil" },
      { href: "/categories", label: "Catégories" },
      { href: "/produits", label: "Produits" },
      { href: "/panier", label: "Panier" },
      { href: "/#faq", label: "FAQ" },
    ],
    title: "Navigation",
  },
  {
    links: [
      { href: "/produits?platform=steam", label: "Steam" },
      { href: "/produits?platform=psn", label: "PlayStation" },
      { href: "/produits?platform=xbox", label: "Xbox" },
      { href: "/produits?platform=nintendo", label: "Nintendo" },
      { href: "/produits?platform=jeu-mobile", label: "Jeu mobile" },
    ],
    title: "Plateformes",
  },
  {
    links: [
      { href: "/#faq", label: "Support" },
      { href: "/#faq", label: "Demande produit" },
      { href: "/checkout", label: "Paiement" },
      { href: "/obtenir-votre-produit", label: "Livraison" },
      { href: "/categories", label: "Toutes les catégories" },
      { href: "/cgv", label: "CGV & Mentions légales" },
    ],
    title: "Aide",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-brand-ice/14 bg-brand-navy">
      <div className="mx-auto max-w-[1350px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link
              aria-label="Playsdepot TN"

              href="/"
            >
              <Image src="/logo_white.webp" alt="logo" width={150} height={100} className="" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-brand-periwinkle">
              La plateforme de recharges gaming en Tunisie. Codes officiels,
              livraison rapide et support client accessible.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <SocialLink
                ariaLabel="TikTok"
                href="https://www.tiktok.com/@playsdepot?_r=1&_t=ZS-98OFSx2YVce"
                icon={FaTiktok}
              />
              <SocialLink
                ariaLabel="Instagram"
                href="https://www.instagram.com/playsdepot?igsh=MTUwbjJrY3NyMHAydw%3D%3D"
                icon={FaInstagram}
              />
              <SocialLink
                ariaLabel="Facebook"
                href="https://www.facebook.com/share/18omLxJuGe/"
                icon={FaFacebookF}
              />
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="font-mono text-[11px] font-bold uppercase text-brand-periwinkle">
                {column.title}
              </h2>
              <div className="mt-4 grid gap-2">
                {column.links.map((link) => (
                  <Link
                    className="text-sm text-brand-periwinkle/70 transition hover:text-brand-lavender"
                    href={link.href}
                    key={`${column.title}-${link.label}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-brand-ice/14 pt-6 text-xs text-brand-periwinkle/70 md:flex-row md:items-center md:justify-between">
          <p className="font-mono">© 2026 Playsdepot — Tous droits réservés</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2">
              <Zap className="size-3 text-brand-lavender" />
              Livraison rapide
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-3 text-brand-lavender" />
              Codes officiels garantis
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  ariaLabel,
  className,
  href,
  icon: Icon,
}: {
  ariaLabel: string;
  className?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={`flex size-9 items-center justify-center rounded-lg border border-brand-ice/14 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender ${className ?? ""}`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icon className="size-4" />
    </Link>
  );
}
