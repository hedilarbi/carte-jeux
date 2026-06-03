import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/site/auth/auth-panel";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function InscriptionPage() {
  return (
    <AuthPanel
      endpoint="/api/auth/register"
      eyebrow="// Inscription"
      fields={[
        {
          autoComplete: "email",
          label: "Email",
          name: "email",
          placeholder: "votre@email.com",
          type: "email",
        },
        {
          autoComplete: "new-password",
          label: "Mot de passe",
          name: "password",
          placeholder: "Créer un mot de passe",
          type: "password",
        },
        {
          autoComplete: "new-password",
          label: "Confirmer le mot de passe",
          name: "passwordConfirmation",
          placeholder: "Répéter le mot de passe",
          type: "password",
        },
      ]}
      footer={
        <>
          Déjà un compte ?{" "}
          <Link className="font-black text-[#012D69] hover:underline" href="/connexion">
            Connexion
          </Link>
        </>
      }
      helper="Créez un compte pour retrouver vos commandes et accélérer vos prochains achats."
      submitLabel="Créer le compte"
      sideTitle={
        <>
          Bienvenue !<br />
          Créez votre espace joueur
        </>
      }
      successRedirect="/"
      successText="Compte créé."
      title="Créer un compte PlaySDepot"
    />
  );
}
