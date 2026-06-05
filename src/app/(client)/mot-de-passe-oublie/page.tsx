import type { Metadata } from "next";
import Image from "next/image";
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
      sideContent={
        <Image
          alt="Mot de passe oublié"
          className="h-auto w-full max-w-[620px]"
          height={620}
          priority
          src="/mot_pass_oublie.png"
          width={620}
        />
      }
      showSocial={false}
      submitLabel="Envoyer le lien"
      successText="Si un compte existe avec cet email, un lien de réinitialisation a été généré."
      title="Réinitialiser le mot de passe"
    />
  );
}
