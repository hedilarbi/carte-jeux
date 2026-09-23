import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { OrderModel } from "@/models/order.model";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("No signature found", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "dummy",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature invalide";
    console.error("Webhook signature verification failed.", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentReference = session.client_reference_id;

    if (paymentReference) {
      await connectToDatabase();
      // Le montant encaissé fait foi : on le reprend de Stripe plutôt que de
      // se fier à ce qui avait été calculé à la création de la session.
      const updatedOrder = await OrderModel.findOneAndUpdate(
        { paymentReference },
        {
          paymentStatus: "paid",
          paidAt: new Date(),
          ...(typeof session.amount_total === "number" && session.currency
            ? {
                paymentCurrency: session.currency.toUpperCase(),
                paymentTotal: session.amount_total / 100,
              }
            : {}),
        },
        { returnDocument: "after" }
      );

      if (updatedOrder) {
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
      }
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
