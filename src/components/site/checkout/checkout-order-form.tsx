"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, ShoppingBag, UserRound } from "lucide-react";

import { fetchJson } from "@/lib/utils/fetch-json";
import type { Cart, CartItem, Order } from "@/types/entities";

function formatPrice(value: number) {
  return value.toFixed(3).replace(".", ",");
}

function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

interface CheckoutCustomer {
  email: string;
  firstName: string;
  lastName: string;
}

export function CheckoutOrderForm({
  cart,
  customer,
}: {
  cart: Cart | null;
  customer?: CheckoutCustomer;
}) {
  const router = useRouter();
  const items = cart?.items ?? [];
  const hasItems = items.length > 0;
  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isAuthenticated = Boolean(customer);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending || !hasItems) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const order = await fetchJson<Order>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerFirstName: firstName,
          customerLastName: lastName,
          customerEmail: email,
          paymentMethod: "floussi",
        }),
      });

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: { items: [] },
        }),
      );
      router.push(
        `/obtenir-votre-produit?order=${encodeURIComponent(order.orderNumber)}`,
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible de valider la commande.",
      );
    } finally {
      setIsPending(false);
    }
  }

  if (!cart || !hasItems) {
    return <EmptyCheckout />;
  }

  return (
    <form
      className="mx-auto grid max-w-[1200px] gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_437px] lg:items-start"
      onSubmit={handleSubmit}
    >
      <section className="grid gap-[15px]">
        <PaymentMethodCard />
        <CustomerInfoCard
          email={email}
          firstName={firstName}
          isAuthenticated={isAuthenticated}
          lastName={lastName}
          onEmailChange={setEmail}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
        />
      </section>

      <CheckoutSummary
        cart={cart}
        error={error}
        isPending={isPending}
      />
    </form>
  );
}

function PaymentMethodCard() {
  return (
    <button
      className="grid min-h-[144px] w-full grid-cols-[116px_minmax(0,1fr)_59px] items-center gap-6 bg-white/37 px-8 text-left shadow-[0_4px_4px_#B1A3F5] transition hover:bg-white/55"
      type="button"
    >
      <span className="flex size-[116px] items-center justify-center rounded-3xl bg-white/70">
        <Image
          alt="Floussi"
          className="h-auto w-[86px] object-contain"
          height={80}
          src="/floussi.png"
          width={120}
        />
      </span>

      <span className="min-w-0">
        <span className="block font-body text-base font-bold leading-7 text-[#012D69]">
          Floussi
        </span>
        <span className="mt-2 block font-inter text-xs font-semibold leading-5 text-black/60">
          Paiement via application mobile
        </span>
      </span>

      <span className="flex size-[59px] items-center justify-center rounded-full border-[3px] border-[#B0A4F5] bg-white/48">
        <span className="size-6 rounded-full bg-[#B0A4F5]" />
      </span>
    </button>
  );
}

function CustomerInfoCard({
  email,
  firstName,
  isAuthenticated,
  lastName,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
}: {
  email: string;
  firstName: string;
  isAuthenticated: boolean;
  lastName: string;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 bg-white/37 px-8 py-7 shadow-[0_4px_4px_#B1A3F5]">
      <span className="flex items-center gap-3 font-body text-base font-bold text-[#012D69]">
        <UserRound className="size-5" />
        Informations de livraison
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-inter text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]/70">
            Prénom
          </span>
          <input
            className="h-13 w-full rounded-[14px] border border-[#DADDFF] bg-white/74 px-4 font-inter text-sm font-semibold text-[#00061E] outline-none placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16 read-only:text-[#012D69]/70"
            maxLength={80}
            onChange={(event) => onFirstNameChange(event.target.value)}
            placeholder="Votre prénom"
            readOnly={isAuthenticated}
            required
            type="text"
            value={firstName}
          />
        </label>
        <label className="grid gap-2">
          <span className="font-inter text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]/70">
            Nom
          </span>
          <input
            className="h-13 w-full rounded-[14px] border border-[#DADDFF] bg-white/74 px-4 font-inter text-sm font-semibold text-[#00061E] outline-none placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16 read-only:text-[#012D69]/70"
            maxLength={80}
            onChange={(event) => onLastNameChange(event.target.value)}
            placeholder="Votre nom"
            readOnly={isAuthenticated}
            required
            type="text"
            value={lastName}
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="flex items-center gap-2 font-inter text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]/70">
          <Mail className="size-4" />
          Email
        </span>
        <input
          className="h-13 w-full rounded-[14px] border border-[#DADDFF] bg-white/74 px-4 font-inter text-sm font-semibold text-[#00061E] outline-none placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16 read-only:text-[#012D69]/70"
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="votre@email.com"
          readOnly={isAuthenticated}
          required
          type="email"
          value={email}
        />
      </label>
      {isAuthenticated ? (
        <p className="font-inter text-xs font-semibold leading-5 text-[#012D69]/60">
          Ces informations viennent de votre compte client.
        </p>
      ) : null}
    </div>
  );
}

function CheckoutSummary({
  cart,
  error,
  isPending,
}: {
  cart: Cart;
  error: string | null;
  isPending: boolean;
}) {
  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[680px]">
      <div className="grid gap-[10px]">
        {cart.items.map((item) => (
          <SummaryLine item={item} key={item.productId} />
        ))}
      </div>

      <div className="mt-8 border-t-2 border-[#DADDFF] pt-8 font-inter">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-medium tracking-[0.01em]">
          <span>Articles</span>
          <span className="text-right font-black">
            {countItems(cart.items)}
          </span>
          <span>Total</span>
          <span className="text-right font-black">
            {formatPrice(cart.subtotal)} {cart.currency}
          </span>
          <span>Frais de service</span>
          <span className="text-right font-black">0,000 {cart.currency}</span>
          <span>Réduction</span>
          <span className="text-right font-black">
            {formatPrice(cart.totalDiscount)} {cart.currency}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-inter text-lg font-bold tracking-[0.06em]">
          Total:
        </p>
        <div className="mt-3 flex h-[68px] w-full items-center justify-center bg-[#D9D9D9]/55 text-center font-inter text-2xl font-bold tracking-[0.06em]">
          {formatPrice(cart.total)} {cart.currency}
        </div>
      </div>

      <button
        className="mt-4 flex h-[57px] w-full items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED] disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Validation..." : "Continuer"}
      </button>

      {error ? (
        <p className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 font-inter text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <label className="mt-8 flex items-start gap-3 border-t-2 border-[#DADDFF] pt-8 font-inter text-xs font-medium leading-5 text-black/76">
        <input
          className="mt-1 size-[26px] shrink-0 accent-[#B0A4F5]"
          defaultChecked
          type="checkbox"
        />
        <span>
          J&apos;accepte de recevoir une invitation par e-mail pour évaluer le
          service sur Trustpilot
        </span>
      </label>
    </aside>
  );
}

function SummaryLine({ item }: { item: CartItem }) {
  return (
    <article className="grid grid-cols-[87px_minmax(0,1fr)_26px] gap-5">
      <div className="relative h-[121px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(1,45,105,0.12)]">
        <Image
          alt={item.productTitle}
          className="object-cover"
          fill
          sizes="87px"
          src={item.productImage || "/jeu1.jpg"}
        />
      </div>

      <div className="min-w-0 pt-2">
        <h2 className="truncate font-heading text-sm font-bold tracking-[0.06em] text-black">
          {item.productTitle}
        </h2>
        <p className="mt-3 font-body text-xs font-bold leading-5 text-[#012D69]">
          Produit : {item.sku}
        </p>
        <p className="mt-4 font-heading text-sm tracking-[0.06em] text-black">
          {item.discountPercent > 0 ? (
            <>
              <span className="mr-2 font-medium line-through">
                {formatPrice(item.unitPrice)}
              </span>
              <span className="font-bold no-underline">
                {formatPrice(item.finalUnitPrice)}
              </span>
            </>
          ) : (
            <span className="font-bold">{formatPrice(item.finalUnitPrice)}</span>
          )}
        </p>
      </div>

      <span className="mt-2 flex size-[26px] items-center justify-center rounded-full bg-[#012D69] font-heading text-xs font-bold text-white/90">
        {item.quantity}
      </span>
    </article>
  );
}

function EmptyCheckout() {
  return (
    <section className="mx-auto flex min-h-[520px] max-w-[900px] items-center justify-center px-6 py-12">
      <div className="w-full bg-white/55 p-8 text-center shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#012D69] text-white">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold text-[#012D69]">
          Votre panier est vide
        </h1>
        <p className="mx-auto mt-3 max-w-[460px] font-inter text-sm font-semibold leading-6 text-black/60">
          Ajoutez un produit au panier avant de passer au paiement.
        </p>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-6 font-body text-sm font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
          href="/produits"
        >
          <CheckCircle2 className="size-4" />
          Voir les produits
        </Link>
      </div>
    </section>
  );
}
