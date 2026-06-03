import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/site/auth/auth-panel";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
};

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return (
    <AuthPanel
      endpoint="/api/auth/reset-password"
      eyebrow="// Sécurité"
      fields={[
        {
          autoComplete: "new-password",
          label: "Nouveau mot de passe",
          name: "password",
          placeholder: "Créer un nouveau mot de passe",
          type: "password",
        },
        {
          autoComplete: "new-password",
          label: "Confirmer le mot de passe",
          name: "passwordConfirmation",
          placeholder: "Répéter le nouveau mot de passe",
          type: "password",
        },
      ]}
      footer={
        <>
          Retour à la{" "}
          <Link className="font-black text-[#012D69] hover:underline" href="/connexion">
            connexion
          </Link>
        </>
      }
      helper="Choisissez un nouveau mot de passe pour votre compte."
      hiddenFields={{ token }}
      showSocial={false}
      submitLabel="Mettre à jour"
      successRedirect="/connexion"
      successText="Mot de passe mis à jour."
      title="Créer un nouveau mot de passe"
    />
  );
}
