import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

import { PurchaseTracker } from "@/components/site/checkout/purchase-tracker";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types/entities";

async function getOrderIfPaid(orderNumber: string): Promise<Order | null> {
  try {
    const order = await orderService.getByOrderNumber(orderNumber);

    return order.paymentStatus === "paid" ? order : null;
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_number?: string }>;
}) {
  const { session_id, order_number } = await searchParams;

  let order: Order | null = null;

  // Retour ClicToPay : la commande n'est affichée que si elle est réellement
  // réglée en base, ce que seule la vérification serveur a pu écrire.
  if (!session_id) {
    if (!order_number) {
      redirect("/");
    }
    
    order = await getOrderIfPaid(order_number);
    if (!order) {
      redirect("/");
    }
  }

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid") {
        redirect("/");
      }
    } catch (error) {
      console.error("Error retrieving Stripe session", error);
      redirect("/");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] px-6 py-12">
      {order && (
        <PurchaseTracker 
          orderNumber={order.orderNumber} 
          value={order.total} 
          currency={order.currency} 
        />
      )}
      <div className="w-full max-w-[600px] rounded-2xl bg-white/55 p-10 text-center shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
          <CheckCircle2 className="size-10" />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-bold text-[#012D69]">
          Paiement réussi !
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] font-inter text-base font-medium leading-7 text-black/70">
          Merci pour votre commande. Votre paiement a été traité avec succès.
        </p>

        {order_number && (
          <div className="mt-6 rounded-xl bg-white/70 p-4">
            <p className="font-inter text-sm font-semibold text-black/60">
              Numéro de commande
            </p>
            <p className="mt-1 font-body text-xl font-bold text-[#012D69]">
              {order_number}
            </p>
          </div>
        )}

        <Link
          className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-6 font-body text-base font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
          href="/"
        >
          Retourner à la boutique
        </Link>
      </div>
    </main>
  );
}
