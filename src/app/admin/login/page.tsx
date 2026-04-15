import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminPageSession } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  const session = await getAdminPageSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,105,255,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(17,208,145,0.14),_transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(3,8,20,0.45)] backdrop-blur md:p-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
              Eneba Admin
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Accès au backoffice marketplace.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300">
              La zone d’administration utilise maintenant un cookie de session
              signé. Connectez-vous avec un compte administrateur MongoDB actif
              pour accéder au tableau de bord.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
