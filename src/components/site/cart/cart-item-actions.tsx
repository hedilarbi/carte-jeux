"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartItemActions({
  productReference,
  quantity,
}: {
  productReference: string;
  quantity: number;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function mutateCart(method: "PATCH" | "DELETE", nextQuantity?: number) {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(
        `/api/cart/items/${encodeURIComponent(productReference)}`,
        {
          method,
          headers:
            method === "PATCH"
              ? {
                  "Content-Type": "application/json",
                }
              : undefined,
          body:
            method === "PATCH"
              ? JSON.stringify({ quantity: nextQuantity })
              : undefined,
        },
      );
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Impossible de mettre à jour le panier.",
        );
      }

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: payload.data,
        }),
      );
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-[180px] items-center justify-between bg-[#A1A1A1]/30 px-5 font-inter text-base font-bold text-black">
        <button
          aria-label="Diminuer la quantité"
          className="flex size-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
          disabled={isPending}
          onClick={() =>
            quantity <= 1
              ? mutateCart("DELETE")
              : mutateCart("PATCH", quantity - 1)
          }
          type="button"
        >
          <Minus className="size-5 opacity-70" />
        </button>
        <span className="opacity-80">{quantity}</span>
        <button
          aria-label="Augmenter la quantité"
          className="flex size-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
          disabled={isPending}
          onClick={() => mutateCart("PATCH", quantity + 1)}
          type="button"
        >
          <Plus className="size-5 opacity-70" />
        </button>
      </div>

      <button
        aria-label="Supprimer le produit"
        className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_10px_rgba(1,45,105,0.12)] transition hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
        disabled={isPending}
        onClick={() => mutateCart("DELETE")}
        type="button"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
