import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, Mail, PackageCheck } from "lucide-react";

const steps = ["Panier", "Paiement", "Obtenir votre produit"] as const;

const orderItems = [
  {
    name: "PUB G Mobile 60 UC",
    product: "PUBG Mobile 60 UC",
    quantity: 1,
    image: "/jeu1.jpg",
    price: "4,400",
    originalPrice: "4,900",
  },
  {
    name: "GTA V PREMIUM",
    product: "GTA V ROCKSTAR",
    quantity: 2,
    image: "/jeu1.jpg",
    price: "35,000",
    originalPrice: "50,000",
  },
  {
    name: "Carte steam 10€",
    product: "carte steamC",
    quantity: 1,
    image: "/jeu1.jpg",
    price: "40,000",
    originalPrice: null,
  },
] as const;

export default function GetProductPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <GetProductProgress />

      <section className="mx-auto grid max-w-[1200px] gap-8 px-6 py-11 lg:grid-cols-[minmax(0,1fr)_437px] lg:items-start">
        <OrderConfirmation />
        <OrderSummary />
      </section>
    </main>
  );
}

function GetProductProgress() {
  return (
    <section className="bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)] mt-6">
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

function OrderConfirmation() {
  return (
    <section className="pt-6 lg:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <CheckCircle2 className="size-16 shrink-0 text-[#39B54A]" />

        <div className="max-w-[790px]">
          <h1 className="font-heading text-2xl font-medium leading-tight tracking-[0.02em] text-black md:text-3xl">
            Merci pour votre commande
          </h1>

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

function OrderSummary() {
  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[753px]">
      <div className="grid gap-[10px]">
        {orderItems.map((item) => (
          <SummaryLine item={item} key={item.name} />
        ))}
      </div>

      <div className="mt-8 border-t-2 border-[#DADDFF] pt-8 font-inter">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-medium tracking-[0.01em]">
          <span>Total</span>
          <span className="text-right font-black">79,400</span>
          <span>Frais de service</span>
          <span className="text-right font-black">0,900</span>
          <span>Réduction</span>
          <span className="text-right font-black">15%</span>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-inter text-lg font-bold tracking-[0.06em]">
          Total:
        </p>
        <div className="mt-3 flex h-[68px] w-full items-center justify-center bg-[#D9D9D9]/55 text-center font-inter text-2xl font-bold tracking-[0.06em] blur-[0.2px]">
          60,300
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({ item }: { item: (typeof orderItems)[number] }) {
  return (
    <article className="grid grid-cols-[87px_minmax(0,1fr)_26px] gap-5">
      <div className="relative h-[121px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(1,45,105,0.12)]">
        <Image
          alt={item.name}
          className="object-cover"
          fill
          sizes="87px"
          src={item.image}
        />
      </div>

      <div className="min-w-0 pt-2">
        <h2 className="truncate font-heading text-sm font-bold tracking-[0.06em] text-black">
          {item.name}
        </h2>
        <p className="mt-3 font-body text-xs font-bold leading-5 text-[#012D69]">
          Produit : {item.product}
        </p>
        <p className="mt-4 font-heading text-sm tracking-[0.06em] text-black">
          {item.originalPrice ? (
            <>
              <span className="mr-2 font-medium line-through">
                {item.originalPrice}
              </span>
              <span className="font-bold no-underline">{item.price}</span>
            </>
          ) : (
            <span className="font-bold">{item.price}</span>
          )}
        </p>
      </div>

      <span className="mt-2 flex size-[26px] items-center justify-center rounded-full bg-[#012D69] font-heading text-[13px] font-bold text-white/90">
        {item.quantity}
      </span>
    </article>
  );
}
