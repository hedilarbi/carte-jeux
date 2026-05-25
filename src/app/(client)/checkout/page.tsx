import Image from "next/image";
import {
  Check,
  CreditCard,
  Landmark,
  Smartphone,
} from "lucide-react";

const paymentMethods = [
  {
    name: "Carte Visa / Carte Mastercard",
    description: "Paiement sécurisé par carte bancaire",
    icon: CreditCard,
  },
  {
    name: "D17 / E-dinar",
    description: "Paiement local en dinars tunisiens",
    icon: Landmark,
  },
  {
    name: "Via Application Flousi",
    description: "Validation rapide via application mobile",
    icon: Smartphone,
  },
] as const;

const summaryItems = [
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

const steps = ["Panier", "Paiement", "Obtenir votre produit"] as const;

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <CheckoutProgress />

      <section className="mx-auto grid max-w-[1200px] gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_437px] lg:items-start">
        <PaymentMethods />
        <CheckoutSummary />
      </section>
    </main>
  );
}

function CheckoutProgress() {
  return (
    <section className="bg-[#012D69] px-6 py-6 text-white shadow-[0_10px_30px_rgba(1,45,105,0.2)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
        {steps.map((step, index) => {
          const isDone = index === 0;
          const isActive = index === 1;

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

function PaymentMethods() {
  return (
    <div className="grid gap-[15px]">
      {paymentMethods.map((method, index) => (
        <button
          className="group grid min-h-[144px] w-full grid-cols-[116px_minmax(0,1fr)_59px] items-center gap-6 bg-white/37 px-8 text-left shadow-[0_4px_4px_#B1A3F5] transition hover:bg-white/55"
          key={method.name}
          type="button"
        >
          <span className="flex size-[116px] items-center justify-center rounded-3xl bg-white/48 text-[#012D69]">
            <method.icon className="size-12" />
          </span>

          <span className="min-w-0">
            <span className="block font-body text-base font-bold leading-7 text-[#012D69]">
              {method.name}
            </span>
            <span className="mt-2 block font-inter text-xs font-semibold leading-5 text-black/60">
              {method.description}
            </span>
          </span>

          <span className="flex size-[59px] items-center justify-center rounded-full border-[3px] border-[#B0A4F5] bg-white/48">
            {index === 0 ? (
              <span className="size-6 rounded-full bg-[#B0A4F5]" />
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}

function CheckoutSummary() {
  return (
    <aside className="rounded-2xl bg-white p-7 text-black shadow-[0_4px_4px_#B0A4F5] backdrop-blur-[2px] lg:min-h-[904px]">
      <div className="grid gap-[10px]">
        {summaryItems.map((item) => (
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

      <button
        className="mt-4 flex h-[57px] w-full items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)]"
        type="button"
      >
        Continuer
      </button>

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

function SummaryLine({ item }: { item: (typeof summaryItems)[number] }) {
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

      <span className="mt-2 flex size-[26px] items-center justify-center rounded-full bg-[#012D69] font-heading text-xs font-bold text-white/90">
        {item.quantity}
      </span>
    </article>
  );
}
