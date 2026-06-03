import Image from "next/image";
import { Check, CheckCircle2 } from "lucide-react";

import { orderService } from "@/services/order.service";
import type { Order, OrderItem } from "@/types/entities";

const steps = ["Panier", "Paiement", "Obtenir votre produit"] as const;

type GetProductPageProps = {
  searchParams: Promise<{
    order?: string | string[];
  }>;
};

async function getOrder(searchParams: GetProductPageProps["searchParams"]) {
  const params = await searchParams;
  const orderParam = Array.isArray(params.order)
    ? params.order[0]
    : params.order;

  if (!orderParam) {
    return null;
  }

  try {
    return await orderService.getByOrderNumber(orderParam);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function formatPrice(value: number) {
  return value.toFixed(3).replace(".", ",");
}

export default async function GetProductPage({
  searchParams,
}: GetProductPageProps) {
  const order = await getOrder(searchParams);

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <GetProductProgress />

      <section className="mx-auto grid max-w-[1200px] gap-8 px-6 py-11 lg:grid-cols-[minmax(0,1fr)_437px] lg:items-start">
        <OrderConfirmation order={order} />
        <OrderSummary order={order} />
      </section>
    </main>
  );
}

function GetProductProgress() {
  return (
    <section className="mt-6 bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
        {steps.map((step, index) => {
          const isDone = index < 2;
          const isActive = index === 2;

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

function OrderConfirmation({ order }: { order: Order | null }) {
  return (
    <section className="pt-6 lg:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <CheckCircle2 className="size-16 shrink-0 text-[#39B54A]" />

        <div className="max-w-[790px]">
          <h1 className="font-heading text-2xl font-medium leading-tight tracking-[0.02em] text-black md:text-3xl">
            Merci pour votre commande
          </h1>

          {order ? (
            <p className="mt-4 font-inter text-base font-black tracking-[0.02em] text-[#012D69]">
              Commande #{order.orderNumber}
            </p>
          ) : null}

          <p className="mt-6 max-w-[760px] text-justify font-inter text-base font-medium leading-7 tracking-[0.02em] text-black md:text-lg">
            Votre commande a été prise en compte et sera traitée dans les
            meilleurs délais. Vous recevrez un e-mail de confirmation de
            commande.
          </p>
        </div>
      </div>
    </section>
  );
}

function OrderSummary({ order }: { order: Order | null }) {
  if (!order) {
    return (
      <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[360px]">
        <p className="font-inter text-sm font-bold leading-6 text-[#012D69]">
          Le résumé de commande sera disponible après validation du paiement.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[753px]">
      <div className="grid gap-[10px]">
        {order.items.map((item, index) => (
          <SummaryLine item={item} key={`${item.sku}-${index}`} />
        ))}
      </div>

      <div className="mt-8 border-t-2 border-[#DADDFF] pt-8 font-inter">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-medium tracking-[0.01em]">
          <span>Total</span>
          <span className="text-right font-black">
            {formatPrice(order.subtotal)} {order.currency}
          </span>
          <span>Frais de service</span>
          <span className="text-right font-black">0,000 {order.currency}</span>
          <span>Réduction</span>
          <span className="text-right font-black">
            {formatPrice(order.totalDiscount)} {order.currency}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-inter text-lg font-bold tracking-[0.06em]">
          Total:
        </p>
        <div className="mt-3 flex h-[68px] w-full items-center justify-center bg-[#D9D9D9]/55 text-center font-inter text-2xl font-bold tracking-[0.06em]">
          {formatPrice(order.total)} {order.currency}
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({ item }: { item: OrderItem }) {
  return (
    <article className="grid grid-cols-[87px_minmax(0,1fr)_26px] gap-5">
      <div className="relative h-[121px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(1,45,105,0.12)]">
        <Image
          alt={item.productTitle}
          className="object-cover"
          fill
          sizes="87px"
          src="/jeu1.jpg"
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

      <span className="mt-2 flex size-[26px] items-center justify-center rounded-full bg-[#012D69] font-heading text-[13px] font-bold text-white/90">
        {item.quantity}
      </span>
    </article>
  );
}
