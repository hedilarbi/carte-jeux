import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  BadgePercent,
  Gamepad2,
  Info,
  ShoppingBag,
} from "lucide-react";

import { CartItemActions } from "@/components/site/cart/cart-item-actions";
import { FavoriteButton } from "@/components/site/favorites/favorite-button";
import { CART_SESSION_COOKIE } from "@/lib/auth/cart-session";
import { cartService } from "@/services/cart.service";
import type { Cart, CartItem } from "@/types/entities";

const inspiredProducts = [
  "Grand Theft Auto V (PSN 5) Edition & Great White Shark Card",
  "PUBG Mobile 325 UC Recharge Global",
  "PlayStation Store Gift Card 10 EUR",
  "Xbox Game Pass Ultimate 1 Month",
  "Free Fire 720 Diamants Global",
];

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

function formatPrice(value: number) {
  return value.toFixed(3);
}

export default async function CartPage() {
  const cart = await getCurrentCart();
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <CartProgress />

      <section className="mx-auto grid max-w-[1200px] gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {items.length > 0 ? (
          <div className="grid gap-5">
            {items.map((item) => (
              <CartItemCard item={item} key={item.productId} />
            ))}
          </div>
        ) : (
          <EmptyCart />
        )}

        <CartSummary cart={cart} itemCount={itemCount} />
      </section>

      <InspiredSection />
    </main>
  );
}

function CartProgress() {
  return (
    <section className="mt-6 bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
        {steps.map((step, index) => (
          <div className="flex min-w-0 flex-1 items-center gap-3" key={step}>
            <div className="flex items-center gap-3">
              <span
                className={
                  index === 0
                    ? "flex size-12 items-center justify-center rounded-full bg-[#81D1FF] font-heading text-lg font-bold text-[#012D69]"
                    : "flex size-10 items-center justify-center rounded-full bg-[#AFAFAF] font-heading text-sm font-bold text-[#012D69]"
                }
              >
                {index + 1}
              </span>
              <span
                className={
                  index === 0
                    ? "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#81D1FF] sm:block"
                    : "hidden font-heading text-sm font-bold uppercase tracking-[0.1em] text-[#E6E6E6] sm:block"
                }
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="h-[3px] min-w-8 flex-1 bg-[linear-gradient(90deg,#D9D9D9_0%,#9B9B9B_100%)]" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyCart() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center bg-white/45 p-8 text-center shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#012D69] text-white">
        <ShoppingBag className="size-7" />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-bold text-[#012D69]">
        Votre panier est vide
      </h1>
      <p className="mt-3 max-w-[440px] text-sm font-semibold leading-6 text-[#00061E]/65">
        Ajoutez un produit depuis le catalogue pour le retrouver ici avec ses
        quantités et son total.
      </p>
      <Link
        className="mt-6 inline-flex h-12 items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 font-body text-sm font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
        href="/produits"
      >
        Voir les produits
      </Link>
    </div>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  const originalLineTotal =
    item.discountPercent > 0 && item.unitPrice > item.finalUnitPrice
      ? formatPrice(item.unitPrice * item.quantity)
      : undefined;

  return (
    <article className="relative grid gap-5 bg-white/37 p-4 shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm md:grid-cols-[170px_minmax(0,1fr)_220px] md:p-5">
      <Link
        className="relative mx-auto aspect-[625/873] w-full max-w-[220px] overflow-hidden bg-white md:mx-0 md:w-[170px] md:max-w-none"
        href={`/produits/${item.productSlug}`}
      >
        <Image
          alt={item.productTitle}
          className="object-cover"
          fill
          sizes="170px"
          src={item.productImage ?? "/jeu1.jpg"}
        />
      </Link>

      <div className="min-w-0 pr-16 md:pr-0">
        <h2 className="font-body text-sm font-bold leading-6 text-[#012D69]">
          Produit :{" "}
          <Link className="hover:underline" href={`/produits/${item.productSlug}`}>
            {item.productTitle}
          </Link>
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 font-body text-xs font-semibold text-[#012D69]">
            {item.platformImage ? (
              <span className="relative size-4 overflow-hidden rounded-full bg-white">
                <Image
                  alt=""
                  className="object-contain"
                  fill
                  sizes="16px"
                  src={item.platformImage}
                />
              </span>
            ) : (
              <Gamepad2 className="size-4" />
            )}
            {item.platformName ?? "Global"}
            <FavoriteButton
              aria-label={`Ajouter aux favoris - ${item.productTitle}`}
              activeClassName="text-danger"
              className="ml-1 flex size-6 items-center justify-center rounded-full bg-[#012D69]/8 text-[#012D69] transition hover:bg-danger hover:text-white"
              iconClassName="size-3.5"
              productId={item.productId}
              productSlug={item.productSlug}
            />
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-white px-3 font-body text-xs font-semibold text-[#012D69]">
            SKU: {item.sku}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-1 text-[#E5B000]">
          {Array.from({ length: 5 }).map((_, index) => (
            <span className="text-base leading-none" key={index}>
              ★
            </span>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 font-body text-xs font-medium tracking-[0.1em] text-black">
          <span className="inline-flex size-5 items-center justify-center rounded-full border border-black text-[11px]">
            <Info className="size-3" />
          </span>
          Livraison numérique après confirmation de paiement.
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-5 md:items-end">
        <div className="mt-12 md:mt-20">
          <CartItemActions
            productReference={item.productSlug || item.productId}
            quantity={item.quantity}
          />
        </div>

        <div className="text-right font-inter">
          <div className="flex items-center justify-end gap-3">
            {originalLineTotal ? (
              <span className="text-lg text-[#2D2D2D] line-through opacity-80">
                {originalLineTotal}
              </span>
            ) : null}
            <span className="text-2xl font-bold tracking-[0.06em] text-[#191919]">
              {formatPrice(item.lineTotal)} {item.currency}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartSummary({
  cart,
  itemCount,
}: {
  cart: Cart | null;
  itemCount: number;
}) {
  const hasItems = itemCount > 0;

  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[725px]">
      <p className="font-inter text-sm font-semibold leading-5 tracking-[0.06em] text-[#012D69]">
        Gagnez des points plus: {Math.round((cart?.total ?? 0) * 5)}
      </p>

      <h2 className="mt-10 font-inter text-xl font-bold tracking-[0.06em]">
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
        <p className="text-lg font-bold tracking-[0.06em]">
          Total ({itemCount} produit{itemCount > 1 ? "s" : ""})
        </p>
        <div className="mt-3 flex min-h-[68px] w-full items-center justify-center bg-[#D9D9D9]/55 px-4 text-center text-2xl font-bold tracking-[0.06em]">
          {formatPrice(cart?.total ?? 0)} {cart?.currency ?? "TND"}
        </div>
      </div>

      <div className="mt-7 border-y-2 border-[#DADDFF] py-5">
        <div className="grid gap-3 font-inter text-sm">
          <div className="flex items-center justify-between gap-4">
            <span>Sous-total</span>
            <span className="font-black">
              {formatPrice(cart?.subtotal ?? 0)} {cart?.currency ?? "TND"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Réduction</span>
            <span className="font-black">
              {formatPrice(cart?.totalDiscount ?? 0)} {cart?.currency ?? "TND"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="font-inter text-sm font-medium tracking-[0.01em] text-black">
          <span className="flex items-center gap-2">
            <BadgePercent className="size-4 text-[#968AE0]" />
            Vous avez un code promo ?
          </span>
          <input
            className="mt-4 h-[57px] w-full bg-[#B0A4F5]/47 px-4 text-center font-inter text-lg font-semibold tracking-[0.01em] text-black outline-none placeholder:text-black/45"
            placeholder="CODE"
          />
        </label>
      </div>
    </aside>
  );
}

function InspiredSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
      <h2 className="font-heading text-lg font-bold leading-6 tracking-[0.06em] text-black">
        Inspiré par vos choix
      </h2>

      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {inspiredProducts.map((name) => (
          <InspiredCard key={name} name={name} />
        ))}
      </div>
    </section>
  );
}

function InspiredCard({ name }: { name: string }) {
  return (
    <article className="relative mx-auto h-[435px] w-full max-w-[220px] overflow-hidden rounded-[15px] bg-white shadow-[0_18px_38px_rgba(1,45,105,0.14)] xl:max-w-[210px]">
      <div className="relative aspect-[625/873]">
        <Image
          alt={name}
          className="object-cover"
          fill
          sizes="220px"
          src="/jeu1.jpg"
        />
        <div className="absolute bottom-0 left-0 right-0 flex h-10 items-center gap-3 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] px-3 text-white">
          <Gamepad2 className="size-7" />
          <span className="text-xs font-bold uppercase leading-3">Global</span>
        </div>
      </div>
      <div className="px-[18px] py-3">
        <h3 className="line-clamp-2 h-[35px] font-body text-xs font-bold leading-[18px] text-[#00061E]">
          {name}
        </h3>
        <p className="mt-3 text-center font-body text-xl font-bold leading-[22px] text-[#012D69]">
          50 Dt
        </p>
      </div>
    </article>
  );
}
