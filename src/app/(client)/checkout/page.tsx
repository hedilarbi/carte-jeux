import { cookies } from "next/headers";
import { Check } from "lucide-react";

import { CheckoutOrderForm } from "@/components/site/checkout/checkout-order-form";
import { CART_SESSION_COOKIE } from "@/lib/auth/cart-session";
import { getCustomerPageSession } from "@/lib/auth/customer";
import { cartService } from "@/services/cart.service";
import { customerAuthService } from "@/services/customer-auth.service";

const steps = ["Panier", "Paiement", "Obtenir votre produit"] as const;

async function getCurrentCart() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  try {
    return await cartService.getCart(sessionId);
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getCurrentCustomer() {
  try {
    const session = await getCustomerPageSession();
    if (!session) {
      return undefined;
    }

    const user = await customerAuthService.getSessionUser(session.userId);

    if (!user) {
      return undefined;
    }

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  } catch {
    return undefined;
  }
}

export default async function CheckoutPage() {
  const [cart, customer] = await Promise.all([
    getCurrentCart(),
    getCurrentCustomer(),
  ]);

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <CheckoutProgress />
      <CheckoutOrderForm
        cart={cart}
        customer={customer}
        paymentConfig={{
          whatsappOrderNumber: process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER,
        }}
      />
    </main>
  );
}

function CheckoutProgress() {
  return (
    <section className="mt-6 bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)]">
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-3">
        {steps.map((step, index) => {
          const isDone = index === 0;
          const isActive = index === 1;

          return (
            <div
              className="flex min-w-0 flex-1 items-center gap-3"
              key={step}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "flex size-12 items-center justify-center rounded-full bg-[linear-gradient(269.92deg,#A7ACF9_-35.44%,#81D1FF_99.93%)] font-heading text-lg font-bold text-[#012D69]"
                      : isDone
                        ? "flex size-10 items-center justify-center rounded-full border border-[#A6D8F5] font-heading text-sm font-bold text-[#A6D8F5]"
                        : "flex size-10 items-center justify-center rounded-full bg-[#AFAFAF] font-heading text-sm font-bold text-[#012D69]"
                  }
                >
                  {isDone ? <Check className="size-5" /> : index + 1}
                </span>
                <span
                  className={
                    isActive
                      ? "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#B7D5FF] sm:block"
                      : isDone
                        ? "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#81D1FF] sm:block"
                        : "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#E6E6E6] sm:block"
                  }
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className={
                    isDone
                      ? "h-[3px] min-w-8 flex-1 bg-[linear-gradient(90deg,#81D1FF_0%,#A3B0FB_100%)]"
                      : "h-[3px] min-w-8 flex-1 bg-[linear-gradient(90deg,#D9D9D9_0%,#9B9B9B_100%)]"
                  }
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
