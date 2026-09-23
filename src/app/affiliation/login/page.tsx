import { redirect } from "next/navigation";

import { AffiliateLoginForm } from "@/components/affiliate/affiliate-login-form";
import { getAffiliatePageSession } from "@/lib/auth/affiliate";

export default async function AffiliateLoginPage() {
  const session = await getAffiliatePageSession();

  if (session) {
    redirect("/affiliation");
  }

  return (
    <main className="admin-theme relative min-h-screen overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,105,255,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(17,208,145,0.1),_transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center justify-center rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_80px_rgba(15,35,68,0.12)] backdrop-blur md:p-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Espace affilié
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Accédez à votre espace affilié.
            </h1>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AffiliateLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
