"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, X } from "lucide-react";

import { fetchJson } from "@/lib/utils/fetch-json";
import { cn } from "@/lib/utils/cn";
import type { Cart } from "@/types/entities";

interface PromoCodeFormProps {
  className?: string;
  currency?: string;
  disabled?: boolean;
  initialAppliedPromoCode?: Cart["appliedPromoCode"];
  initialPromoDiscountAmount?: number;
}

export function PromoCodeForm({
  className,
  currency = "TND",
  disabled = false,
  initialAppliedPromoCode,
  initialPromoDiscountAmount = 0,
}: PromoCodeFormProps) {
  const router = useRouter();
  const [appliedPromoCode, setAppliedPromoCode] = useState(
    initialAppliedPromoCode ?? null,
  );
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(
    initialPromoDiscountAmount,
  );
  const [cartCurrency, setCartCurrency] = useState(currency);
  const [code, setCode] = useState(initialAppliedPromoCode?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setAppliedPromoCode(initialAppliedPromoCode ?? null);
    setPromoDiscountAmount(initialPromoDiscountAmount);
    setCartCurrency(currency);
    setCode(initialAppliedPromoCode?.code ?? "");
  }, [
    currency,
    initialAppliedPromoCode,
    initialPromoDiscountAmount,
  ]);

  function formatPrice(value: number) {
    return value.toFixed(3);
  }

  function formatPromoValue() {
    if (!appliedPromoCode) {
      return "";
    }

    if (appliedPromoCode.type === "percentage") {
      return `-${appliedPromoCode.value}%`;
    }

    return `-${formatPrice(appliedPromoCode.value)} ${cartCurrency}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending || disabled) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const cart = await fetchJson<Cart>("/api/cart/promo-code", {
        method: "POST",
        body: JSON.stringify({
          code,
        }),
      });

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: cart,
        }),
      );
      setAppliedPromoCode(cart.appliedPromoCode ?? null);
      setPromoDiscountAmount(cart.promoDiscountAmount ?? 0);
      setCartCurrency(cart.currency);
      setCode(cart.appliedPromoCode?.code ?? "");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'appliquer ce code promo.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    if (isPending || disabled) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const cart = await fetchJson<Cart>("/api/cart/promo-code", {
        method: "DELETE",
      });

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: cart,
        }),
      );
      setAppliedPromoCode(null);
      setPromoDiscountAmount(0);
      setCartCurrency(cart.currency);
      setCode("");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de retirer ce code promo.",
      );
    } finally {
      setIsPending(false);
    }
  }

  if (appliedPromoCode) {
    return (
      <div className={cn("mt-6", className)}>
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#012D69]/12 bg-[#B0A4F5]/47 px-4 py-3 font-inter">
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]">
              <BadgePercent className="size-4" />
              Code utilisé
            </span>
            <span className="mt-1 block truncate text-lg font-black tracking-[0.08em] text-black">
              {appliedPromoCode.code} {formatPromoValue()}
            </span>
            <span className="mt-1 block text-xs font-bold text-[#012D69]/70">
              Remise : -{formatPrice(promoDiscountAmount)} {cartCurrency}
            </span>
          </span>
          <button
            aria-label="Retirer le code promo"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-white px-3 text-xs font-black uppercase text-[#012D69] transition hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
            disabled={isPending || disabled}
            onClick={handleRemove}
            type="button"
          >
            <X className="size-4" />
            Retirer
          </button>
        </div>
        {error ? (
          <p className="mt-3 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 font-inter text-xs font-bold text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className={cn("mt-6", className)} onSubmit={handleSubmit}>
      <label className="font-inter text-sm font-medium tracking-[0.01em] text-black">
        <span className="flex items-center gap-2">
          <BadgePercent className="size-4 text-[#968AE0]" />
          Vous avez un code promo ?
        </span>
        <div className="mt-4 flex gap-2">
          <input
            className="h-[57px] min-w-0 flex-1 bg-[#B0A4F5]/47 px-4 text-center font-inter text-lg font-semibold uppercase tracking-[0.01em] text-black outline-none placeholder:text-black/45 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || disabled}
            maxLength={40}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="CODE"
            value={code}
          />
          <button
            className="flex h-[57px] shrink-0 items-center justify-center rounded-[14px] bg-[#012D69] px-4 font-body text-xs font-bold uppercase text-white transition hover:bg-[#064FB1] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || disabled || code.trim().length < 2}
            type="submit"
          >
            {isPending ? "..." : "OK"}
          </button>
        </div>
      </label>
      {error ? (
        <p className="mt-3 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 font-inter text-xs font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
