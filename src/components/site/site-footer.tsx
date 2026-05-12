import Link from "next/link";
import type { ComponentType } from "react";
import {
  Camera,
  Gamepad2,
  Globe,
  MessageCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

const footerColumns = [
  {
    title: "Plateformes",
    links: ["Steam", "PlayStation", "Xbox", "Free Fire", "PUBG", "Roblox"],
  },
  {
    title: "Support",
    links: ["WhatsApp", "FAQ", "Remboursement", "Contact"],
  },
  {
    title: "Légal",
    links: ["CGU", "Confidentialité", "Cookies", "À propos"],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-brand-ice/14 bg-brand-navy">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link className="inline-flex items-center gap-3" href="/">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-lavender),var(--brand-electric-blue))] text-brand-navy shadow-[0_0_24px_rgba(185,152,241,0.45)]">
                <Gamepad2 className="size-5" />
              </span>
              <span className="font-heading text-lg font-black text-brand-lilac">
                Game<span className="text-brand-lavender">Zone</span> TN
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-brand-periwinkle">
              La plateforme de recharges gaming en Tunisie. Codes officiels,
              livraison rapide et support client accessible.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <SocialLink ariaLabel="Facebook" icon={Globe} />
              <SocialLink ariaLabel="Instagram" icon={Camera} />
              <SocialLink
                ariaLabel="WhatsApp"
                className="border-[#25d366]/35 bg-[#25d366]/12 text-[#25d366]"
                icon={MessageCircle}
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
                    href="/"
                    key={link}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-brand-ice/14 pt-6 text-xs text-brand-periwinkle/70 md:flex-row md:items-center md:justify-between">
          <p className="font-mono">© 2026 GameZone TN — Tous droits réservés</p>
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
  icon: Icon,
}: {
  ariaLabel: string;
  className?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={`flex size-9 items-center justify-center rounded-lg border border-brand-ice/14 bg-brand-lilac/8 text-brand-periwinkle transition hover:border-brand-lavender hover:text-brand-lavender ${className ?? ""}`}
      href="/"
    >
      <Icon className="size-4" />
    </Link>
  );
}
