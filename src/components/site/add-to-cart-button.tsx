"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { AddedToCartModal } from "@/components/site/cart/added-to-cart-modal";
import { cn } from "@/lib/utils/cn";

interface AddToCartButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  children: ReactNode;
  productId?: string;
  productName?: string;
  productSlug?: string;
  quantity?: number;
  redirectTo?: string;
}

export function AddToCartButton({
  children,
  className,
  disabled,
  productId,
  productName,
  productSlug,
  quantity = 1,
  redirectTo,
  ...props
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const canSubmit = Boolean(productId || productSlug);

  const closeSuccess = useCallback(() => setShowSuccess(false), []);

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

      {/* Monté sur document.body : les cartes produit ont un ancêtre
          `transform`, qui devient le bloc conteneur d'un enfant `fixed` et le
          fait rogner par le `overflow-hidden` de la carte. */}
      {showSuccess && typeof document !== "undefined"
        ? createPortal(
            <AddedToCartModal
              onClose={closeSuccess}
              productName={productName}
            />,
            document.body,
          )
        : null}
    </>
  );
}
