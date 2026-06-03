"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface AddToCartButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  children: ReactNode;
  productId?: string;
  productSlug?: string;
  quantity?: number;
  redirectTo?: string;
}

export function AddToCartButton({
  children,
  className,
  disabled,
  productId,
  productSlug,
  quantity = 1,
  redirectTo,
  ...props
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSubmit = Boolean(productId || productSlug);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    if (!canSubmit) {
      setHasError(true);
      return;
    }

    setIsPending(true);
    setHasError(false);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(productId ? { productId } : {}),
          ...(productSlug ? { slug: productSlug } : {}),
          quantity,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Impossible d'ajouter le produit.",
        );
      }

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: payload.data,
        }),
      );

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setShowSuccess(true);

        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }

        successTimeoutRef.current = setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      setHasError(true);
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        aria-disabled={!canSubmit || disabled || isPending}
        aria-busy={isPending}
        className={cn(hasError && "ring-2 ring-danger/70", className)}
        disabled={disabled || isPending}
        onClick={handleClick}
        type="button"
        {...props}
      >
        {children}
      </button>

      {showSuccess ? (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[120] flex justify-center px-4">
          <div
            className="pointer-events-auto flex min-h-14 max-w-[360px] items-center gap-3 rounded-[16px] border border-emerald-200 bg-white px-5 py-4 font-inter text-sm font-black text-[#012D69] shadow-[0_18px_45px_rgba(1,45,105,0.2)]"
            role="status"
          >
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
            Produit ajouté au panier
          </div>
        </div>
      ) : null}
    </>
  );
}
