"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { PhoneNumberField } from "@/components/site/auth/phone-number-field";
import { fetchJson } from "@/lib/utils/fetch-json";
import { formatProductPrice } from "@/lib/utils/pricing";
import type { Cart, CartItem, Order } from "@/types/entities";

function formatPrice(value: number) {
  return formatProductPrice(value);
}

function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatMessageField(value?: string) {
  return value?.trim() || "Non renseigné";
}

interface CheckoutCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

type PaymentMethod = "whatsapp";

interface CheckoutPaymentConfig {
  whatsappOrderNumber?: string;
}

function normalizeWhatsAppNumber(value?: string) {
  const normalized = value?.replace(/\D/g, "");

  return normalized && /^\d{8,15}$/.test(normalized)
    ? normalized
    : undefined;
}

function buildWhatsAppCheckoutUrl({
  cart,
  order,
  phoneNumber,
}: {
  cart: Cart;
  order: Order;
  phoneNumber: string;
}) {
  const lines = [
    "Bonjour, je souhaite finaliser cette commande :",
    `Commande : ${order.orderNumber}`,
    "",
    "Client :",
    `Prénom : ${formatMessageField(order.customerFirstName)}`,
    `Nom : ${formatMessageField(order.customerLastName)}`,
    `Email : ${formatMessageField(order.customerEmail)}`,
    `Téléphone : ${formatMessageField(order.customerPhone)}`,
    "",
    "Panier :",
    ...cart.items.map(
      (item) =>
        `${item.quantity} × ${item.productTitle} — ${formatPrice(item.lineTotal)} ${item.currency}`,
    ),
    ...(order.appliedPromoCode
      ? [
          "",
          `Code promo : ${order.appliedPromoCode.code}`,
          `Remise promo : ${formatPrice(order.appliedPromoCode.discountAmount ?? 0)} ${order.currency}`,
        ]
      : []),
    "",
    `Total : ${formatPrice(order.total)} ${order.currency}`,
  ];

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CheckoutOrderForm({
  cart,
  customer,
  paymentConfig,
}: {
  cart: Cart | null;
  customer?: CheckoutCustomer;
  paymentConfig: CheckoutPaymentConfig;
}) {
  const items = cart?.items ?? [];
  const hasItems = items.length > 0;
  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const paymentMethod: PaymentMethod = "whatsapp";
  const isAuthenticated = Boolean(customer);
  const whatsAppNumber = normalizeWhatsAppNumber(
    paymentConfig.whatsappOrderNumber,
  );
  const isPaymentConfigured = Boolean(whatsAppNumber);
  const paymentConfigurationMessage =
    "Le numéro WhatsApp de commande doit être configuré avant de continuer.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending || !hasItems || !cart) {
      return;
    }

    if (!isPaymentConfigured) {
      setError(paymentConfigurationMessage);
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const customerPhone = String(formData.get("customerPhone") ?? "");
      const order = await fetchJson<Order>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerFirstName: firstName,
          customerLastName: lastName,
          customerEmail: email,
          customerPhone,
          paymentMethod,
        }),
      });

      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: { items: [] },
        }),
      );
      if (paymentMethod === "whatsapp" && whatsAppNumber) {
        window.location.assign(
          buildWhatsAppCheckoutUrl({
            cart,
            order,
            phoneNumber: whatsAppNumber,
          }),
        );
        return;
      }
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
      className="mx-auto grid max-w-[1350px] gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_437px] lg:items-start"
      onSubmit={handleSubmit}
    >
      <section className="grid gap-[15px]">
        <PaymentMethodsCard
          whatsAppConfigured={Boolean(whatsAppNumber)}
        />
        <CustomerInfoCard
          email={email}
          firstName={firstName}
          isAuthenticated={isAuthenticated}
          lastName={lastName}
          onEmailChange={setEmail}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          phone={customer?.phone}
        />
      </section>

      <CheckoutSummary
        cart={cart}
        error={error}
        isPaymentConfigured={isPaymentConfigured}
        isPending={isPending}
        paymentConfigurationMessage={paymentConfigurationMessage}
      />
    </form>
  );
}

function PaymentMethodsCard({
  whatsAppConfigured,
}: {
  whatsAppConfigured: boolean;
}) {
  return (
    <section className="grid gap-4 bg-white/37 p-5 shadow-[0_4px_4px_#B1A3F5] sm:p-8">
      <div>
        <h2 className="font-body text-base font-bold text-[#012D69]">
          Moyen de paiement
        </h2>
        <p className="mt-1 font-inter text-xs font-semibold leading-5 text-black/60">
          Choisissez le moyen avec lequel vous souhaitez poursuivre votre
          commande.
        </p>
      </div>

      <div className="grid gap-3">
        <PaymentMethodOption
          description="Envoyez votre commande préremplie à notre équipe via WhatsApp."
          icon={<MessageCircle className="size-8" />}
          isConfigured={whatsAppConfigured}
          name="WhatsApp"
          selected
        />
      </div>
    </section>
  );
}

function PaymentMethodOption({
  description,
  icon,
  isConfigured,
  name,
  selected,
}: {
  description: string;
  icon: React.ReactNode;
  isConfigured: boolean;
  name: string;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`grid min-h-[112px] w-full grid-cols-[72px_minmax(0,1fr)_32px] items-center gap-4 rounded-2xl border px-5 text-left transition ${
        selected
          ? "border-[#A582ED] bg-white shadow-[0_8px_22px_rgba(165,130,237,0.16)]"
          : "border-white/70 bg-white/45 hover:border-[#A582ED]/55 hover:bg-white/70"
      }`}
      type="button"
    >
      <span className="flex size-[72px] items-center justify-center rounded-2xl bg-white/80 text-[#012D69]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 font-body text-base font-bold text-[#012D69]">
          {name}
          {!isConfigured ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
              À configurer
            </span>
          ) : null}
        </span>
        <span className="mt-1 block font-inter text-xs font-semibold leading-5 text-black/60">
          {description}
        </span>
      </span>
      <span
        className={`flex size-7 items-center justify-center rounded-full border-2 ${
          selected ? "border-[#B0A4F5] bg-white" : "border-[#012D69]/25 bg-white/48"
        }`}
      >
        {selected ? <span className="size-3.5 rounded-full bg-[#B0A4F5]" /> : null}
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
  phone,
}: {
  email: string;
  firstName: string;
  isAuthenticated: boolean;
  lastName: string;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  phone?: string;
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
      <PhoneNumberField
        defaultValue={phone}
        label="Numéro de téléphone"
        name="customerPhone"
      />
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
  isPaymentConfigured,
  isPending,
  paymentConfigurationMessage,
}: {
  cart: Cart;
  error: string | null;
  isPaymentConfigured: boolean;
  isPending: boolean;
  paymentConfigurationMessage: string;
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
          <span className="text-right font-black">0 {cart.currency}</span>
          <span>Réduction</span>
          <span className="text-right font-black">
            {formatPrice(cart.totalDiscount)} {cart.currency}
          </span>
          {cart.appliedPromoCode ? (
            <>
              <span>Code promo</span>
              <span className="text-right font-black text-[#012D69]">
                {cart.appliedPromoCode.code} · -
                {formatPrice(cart.promoDiscountAmount ?? 0)} {cart.currency}
              </span>
            </>
          ) : null}
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
        disabled={isPending || !isPaymentConfigured}
        type="submit"
      >
        {isPending
          ? "Validation..."
          : "Continuer sur WhatsApp"}
      </button>

      {!isPaymentConfigured ? (
        <p className="mt-3 font-inter text-xs font-semibold leading-5 text-amber-700">
          {paymentConfigurationMessage}
        </p>
      ) : null}

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
      <div className="relative aspect-[625/873] w-[87px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(1,45,105,0.12)]">
        <Image
          alt={item.productTitle}
          className="object-cover"
          fill
          sizes="87px"
          src={item.productImage || "/jeu1.jpg"}
        />
      </div>

      <div className="min-w-0 pt-2">
        <h2 className="truncate font-body text-sm font-bold tracking-[0.06em] text-black">
          {item.productTitle}
        </h2>
        <p className="mt-3 font-body text-xs font-bold leading-5 text-[#012D69]">
          Produit : {item.sku}
        </p>
        <p className="mt-4 font-body text-sm tracking-[0.06em] text-black">
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
