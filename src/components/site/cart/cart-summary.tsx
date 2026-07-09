"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PromoCodeForm } from "@/components/site/cart/promo-code-form";
import { formatProductPrice } from "@/lib/utils/pricing";
import type { Cart } from "@/types/entities";

interface CartSummaryProps {
  cart: Cart | null;
  itemCount: number;
}

function countItems(cart: Cart | null) {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export function CartSummary({
  cart: initialCart,
  itemCount: initialItemCount,
}: CartSummaryProps) {
  const [cart, setCart] = useState(initialCart);

  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  useEffect(() => {
    function handleCartUpdate(event: Event) {
      const nextCart = (event as CustomEvent<Cart>).detail;

      if (nextCart) {
        setCart(nextCart);
      }
    }

    window.addEventListener("cart:updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate);
    };
  }, []);

  const itemCount = cart ? countItems(cart) : initialItemCount;
  const hasItems = itemCount > 0;
  const currency = cart?.currency ?? "TND";
  const promoDiscountAmount = cart?.appliedPromoCode
    ? cart.promoDiscountAmount ?? 0
    : 0;
  const productDiscountAmount = Math.max(
    0,
    (cart?.totalDiscount ?? 0) - promoDiscountAmount,
  );

  return (
    <aside className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] sm:p-7 lg:min-h-[725px]">
      <p className="break-words font-inter text-sm font-semibold leading-5 tracking-[0.06em] text-[#012D69]">
        Gagnez des points plus: {Math.round((cart?.total ?? 0) * 5)}
      </p>

      <h2 className="mt-10 break-words font-inter text-xl font-bold tracking-[0.06em]">
        Récapitulatif
      </h2>

      {hasItems ? (
        <Link
          className="mt-8 flex h-14 w-full items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
          href="/checkout"
        >
          Passer au paiement
        </Link>
      ) : (
        <button
          className="mt-8 flex h-14 w-full cursor-not-allowed items-center justify-center rounded-[14px] bg-[#B0A4F5]/45 px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black/55"
          disabled
          type="button"
        >
          Passer au paiement
        </button>
      )}

      <div className="mt-9 font-inter">
        <p className="break-words text-lg font-bold tracking-[0.06em]">
          Total ({itemCount} produit{itemCount > 1 ? "s" : ""})
        </p>
        <div className="mt-3 flex min-h-[68px] w-full min-w-0 items-center justify-center overflow-hidden bg-[#D9D9D9]/55 px-3 text-center text-xl font-bold leading-tight tracking-[0.04em] sm:px-4 sm:text-2xl sm:tracking-[0.06em]">
          {formatProductPrice(cart?.total ?? 0)} {currency}
        </div>
      </div>

      <div className="mt-7 border-y-2 border-[#DADDFF] py-5">
        <div className="grid gap-3 font-inter text-sm">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <span>Sous-total</span>
            <span className="break-words text-right font-black">
              {formatProductPrice(cart?.subtotal ?? 0)} {currency}
            </span>
          </div>
          <PromoCodeForm
            className="mt-0"
            currency={currency}
            disabled={!hasItems}
            initialAppliedPromoCode={cart?.appliedPromoCode}
            initialPromoDiscountAmount={cart?.promoDiscountAmount}
          />
          {productDiscountAmount > 0 ? (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span>Réduction produits</span>
              <span className="break-words text-right font-black">
                {formatProductPrice(productDiscountAmount)} {currency}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
