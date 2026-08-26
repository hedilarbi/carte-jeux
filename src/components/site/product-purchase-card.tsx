"use client";

import { useState } from "react";
import { Info, Minus, Plus, ShoppingCart } from "lucide-react";

import { AddToCartButton } from "@/components/site/add-to-cart-button";

import { useCurrency } from "@/components/site/providers/currency-provider";
import { formatPriceWithCurrency } from "@/lib/utils/currency";

type ProductPurchaseCardProduct = {
  currency: string;
  id: string;
  originalPrice?: string;
  rawOriginalPrice?: number;
  points: number;
  price: string;
  rawPrice: number;
  slug: string;
};

const minQuantity = 1;
const maxQuantity = 99;

export function ProductPurchaseCard({
  product,
}: {
  product: ProductPurchaseCardProduct;
}) {
  const [quantity, setQuantity] = useState(minQuantity);
  const { currency, isLoading } = useCurrency();

  function decrementQuantity() {
    setQuantity((currentQuantity) =>
      Math.max(minQuantity, currentQuantity - 1),
    );
  }

  function incrementQuantity() {
    setQuantity((currentQuantity) =>
      Math.min(maxQuantity, currentQuantity + 1),
    );
  }

  // Precompute formatted prices
  const displayOriginalPrice = product.rawOriginalPrice 
    ? formatPriceWithCurrency(product.rawOriginalPrice, currency)
    : product.originalPrice ? `${product.originalPrice} ${currency}` : undefined;
    
  const displayPrice = product.rawPrice 
    ? formatPriceWithCurrency(product.rawPrice, currency)
    : `${product.price} ${currency}`;

  return (
    <aside className="rounded-[21px] bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px]">
      <p className="text-xl font-semibold leading-5 tracking-[0.06em]">
        Gagnez des points plus: {product.points}
      </p>

      <div className="mt-10 flex items-center justify-between gap-4">
        <span className="text-xl font-bold tracking-[0.06em]">Quantité:</span>
        <div className="flex h-11 w-[176px] items-center justify-between bg-[#D9D9D9]/60 px-5 text-base font-bold">
          <button
            aria-label="Diminuer la quantité"
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={quantity <= minQuantity}
            onClick={decrementQuantity}
            type="button"
          >
            <Minus className="size-5" />
          </button>
          <span className="min-w-8 text-center">{quantity}</span>
          <button
            aria-label="Augmenter la quantité"
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={quantity >= maxQuantity}
            onClick={incrementQuantity}
            type="button"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xl font-bold tracking-[0.06em]">Prix:</p>
        <div className="mt-3 flex min-h-14 w-full flex-col items-center justify-center bg-[#D9D9D9]/55 px-4 text-center font-bold tracking-[0.06em]">
          {isLoading ? (
            <span className="text-xl opacity-50">Calcul...</span>
          ) : (
            <>
              {displayOriginalPrice ? (
                <span className="text-sm text-[#2D2D2D]/70 line-through">
                  {displayOriginalPrice}
                </span>
              ) : null}
              <span className="text-xl">
                {displayPrice}
              </span>
            </>
          )}
        </div>
      </div>

      <AddToCartButton
        className="mt-10 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-4 py-4 text-center text-lg font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
        productId={product.id}
        productSlug={product.slug}
        quantity={quantity}
        redirectTo="/panier"
      >
        <ShoppingCart className="size-5" />
        Acheter maintenant
      </AddToCartButton>

      <p className="mt-5 flex items-start gap-2 text-xs font-semibold leading-5 text-[#012D69]/75">
        <Info className="mt-0.5 size-4 shrink-0" />
        Produit numérique livré après confirmation de paiement.
      </p>
    </aside>
  );
}
