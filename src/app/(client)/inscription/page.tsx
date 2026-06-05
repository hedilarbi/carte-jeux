import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/site/auth/auth-panel";
import { RegistrationOtpForm } from "@/components/site/auth/registration-otp-form";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function InscriptionPage() {
  return (
    <AuthPanel
      eyebrow="// Inscription"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link className="font-black text-[#012D69] hover:underline" href="/connexion">
            Connexion
          </Link>
        </>
      }
      form={<RegistrationOtpForm />}
      helper="Créez un compte pour retrouver vos commandes et accélérer vos prochains achats."
      sideTitle={
        <>
          Bienvenue !<br />
          Créez votre espace joueur
        </>
      }
      title="Créer un compte PlaySDepot"
    />
  );
}
