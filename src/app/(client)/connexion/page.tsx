import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/site/auth/auth-panel";

export const metadata: Metadata = {
  title: "Connexion",
};

function resolveAuthError(error?: string | string[]) {
  const value = Array.isArray(error) ? error[0] : error;

  switch (value) {
    case "google_not_configured":
      return "La connexion Google n'est pas encore configurée.";
    case "facebook_not_configured":
      return "La connexion Facebook n'est pas encore configurée.";
    case "invalid_oauth_state":
      return "La session de connexion sociale a expiré. Réessayez.";
    case "google_profile_error":
    case "facebook_profile_error":
      return "Impossible de récupérer le profil social.";
    default:
      return undefined;
  }
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const authError = resolveAuthError(params.error);

  return (
    <AuthPanel
      endpoint="/api/auth/login"
      eyebrow="// Connexion"
      fields={[
        {
          autoComplete: "email",
          label: "Email",
          name: "email",
          placeholder: "votre@email.com",
          type: "email",
        },
        {
          autoComplete: "current-password",
          label: "Mot de passe",
          name: "password",
          placeholder: "Votre mot de passe",
          type: "password",
        },
      ]}
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link className="font-black text-[#012D69] hover:underline" href="/inscription">
            Inscription
          </Link>
        </>
      }
      forgotPasswordHref="/mot-de-passe-oublie"
      helper={
        authError ? (
          <span className="block rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
            {authError}
          </span>
        ) : undefined
      }
      submitLabel="Se connecter"
      sideTitle={
        <>
          Bonjour !<br />
          C&apos;est un plaisir de vous voir !
        </>
      }
      successRedirect="/"
      successText="Connexion réussie."
      title="Connectez-vous à votre compte"
    />
  );
}
