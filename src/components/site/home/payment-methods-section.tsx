import { paymentMethods } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";

export function PaymentMethodsSection() {
  return (
    <section className="bg-brand-lilac/5 py-10">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-6 text-center">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-lavender">
            {"// Moyens de paiement"}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {paymentMethods.map((method) => (
            <article
              className="flex items-center gap-3 rounded-2xl border border-brand-ice/14 bg-brand-navy/76 px-5 py-3 transition hover:-translate-y-0.5 hover:border-brand-lavender/45"
              key={`${method.name}-${method.type}`}
            >
              <span className="text-brand-lavender">
                <HomeIcon className="size-5" name={method.icon} />
              </span>
              <div>
                <h3 className="font-heading text-xs font-bold uppercase text-brand-lilac">
                  {method.name}
                </h3>
                <p className="font-mono text-[10px] uppercase text-brand-periwinkle/55">
                  {method.type}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
