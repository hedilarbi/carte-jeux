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
              Dark admin infrastructure for manual digital goods fulfillment.
            </h1>
          </div>
          <Link
            href="/admin"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 md:inline-flex"
          >
            Open Admin
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 py-12 md:grid-cols-3">
          {[
            {
              title: "Product catalog",
              description:
                "Manage gift cards, subscriptions, recharge cards, and game credits in one catalog.",
              icon: Ticket,
            },
            {
              title: "Manual sourcing workflow",
              description:
                "Track paid orders, supplier purchases, and manual code delivery from a single backoffice.",
              icon: ShoppingCart,
            },
            {
              title: "Admin-first operations",
              description:
                "Shared route handlers, typed services, and scaffolded admin auth prepared for production hardening.",
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
              Admin auth scaffold
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Configure `ADMIN_SESSION_TOKEN` with an `admin_session` cookie or
              enable `ADMIN_DEV_BYPASS=true` in local development to access the
              backoffice.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Continue to Admin
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
