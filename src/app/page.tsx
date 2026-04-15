import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingCart, Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,105,255,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(17,208,145,0.14),_transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(3,8,20,0.45)] backdrop-blur md:p-12">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
              Eneba Marketplace OS
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Infrastructure admin sombre pour la gestion manuelle de produits digitaux.
            </h1>
          </div>
          <Link
            href="/admin"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 md:inline-flex"
          >
            Ouvrir l’administration
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 py-12 md:grid-cols-3">
          {[
            {
              title: "Catalogue produits",
              description:
                "Gérez cartes cadeaux, abonnements, cartes de recharge et crédits de jeu dans un seul catalogue.",
              icon: Ticket,
            },
            {
              title: "Processus d'achat manuel",
              description:
                "Suivez les commandes payées, les achats fournisseurs et l'envoi manuel des codes depuis un seul backoffice.",
              icon: ShoppingCart,
            },
            {
              title: "Opérations orientées admin",
              description:
                "Des route handlers partagés, des services typés et une auth admin préparée pour un durcissement production.",
              icon: ShieldCheck,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <item.icon className="size-5 text-sky-300" />
              <h2 className="mt-4 text-lg font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-sky-400/20 bg-slate-950/70 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">
              Connexion administrateur
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Utilisez `/admin/login` avec un compte administrateur MongoDB actif.
              La signature de session locale est configurée via `ADMIN_SESSION_SECRET`.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Continuer vers l’administration
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
