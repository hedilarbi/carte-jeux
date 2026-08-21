import { Suspense } from "react";

import { CheckoutVerificationClient } from "@/components/site/checkout/checkout-verification-client";

/**
 * Page de retour ClicToPay. La passerelle y renvoie le client avec
 * `?orderId=<identifiant de transaction>` aussi bien après un succès qu'après
 * un échec : le statut réel est redemandé côté serveur.
 */
export default function CheckoutVerificationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] px-6 py-12">
      <Suspense
        fallback={
          <p className="font-inter text-sm font-semibold text-black/60">
            Chargement...
          </p>
        }
      >
        <CheckoutVerificationClient />
      </Suspense>
    </main>
  );
}
