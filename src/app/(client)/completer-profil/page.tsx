import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/site/auth/auth-panel";
import { CompleteProfileForm } from "@/components/site/auth/complete-profile-form";
import { getCustomerPageSession } from "@/lib/auth/customer";
import { customerAuthService } from "@/services/customer-auth.service";

export const metadata: Metadata = {
  title: "Compléter le profil",
};

export default async function CompleteProfilePage() {
  const session = await getCustomerPageSession();

  if (!session) {
    redirect("/connexion");
  }

  const user = await customerAuthService.getSessionUser(session.userId);

  if (!user) {
    redirect("/connexion");
  }

  if (user.firstName && user.lastName && user.phone) {
    redirect("/");
  }

  return (
    <AuthPanel
      eyebrow="// Profil"
      footer="Ces informations restent liées à votre compte client."
      form={
        <CompleteProfileForm
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          }}
        />
      }
      helper="Ajoutez les informations manquantes pour finaliser votre compte et faciliter vos commandes."
      sideTitle={
        <>
          Dernière étape<br />
          Complétez votre profil
        </>
      }
      showSocial={false}
      title="Compléter votre profil"
    />
  );
}
