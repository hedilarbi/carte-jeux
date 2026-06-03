import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/site/auth/auth-panel";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function MotDePasseOubliePage() {
  return (
    <AuthPanel
      endpoint="/api/auth/forgot-password"
      eyebrow="// Récupération"
      fields={[
        {
          autoComplete: "email",
          label: "Email",
          name: "email",
          placeholder: "votre@email.com",
          type: "email",
        },
      ]}
      footer={
        <>
          Vous connaissez votre mot de passe ?{" "}
          <Link className="font-black text-[#012D69] hover:underline" href="/connexion">
            Connexion
          </Link>
        </>
      }
      helper="Entrez votre email pour recevoir les instructions de réinitialisation."
      showSocial={false}
      submitLabel="Envoyer le lien"
      successText="Si un compte existe avec cet email, un lien de réinitialisation a été généré."
      title="Réinitialiser le mot de passe"
    />
  );
}
