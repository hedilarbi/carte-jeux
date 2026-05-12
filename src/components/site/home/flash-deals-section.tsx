import { Clock3 } from "lucide-react";

import { products } from "@/components/site/home/home-data";
import { ProductCard } from "@/components/site/home/product-card";
import { SubscriptionsSection } from "./subscriptions-section";

const flashProducts = products.filter((product) => product.originalPrice).slice(0, 4);

export function FlashDealsSection() {
  return (
    <section className="bg-brand-light py-16">
      <div className="mx-auto max-w-[1400px] lg:ml-[100px] lg:mr-[50px] px-6">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase text-brand-dark">
              {"// Flash"}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
              Promotions jeux vidéo & recharges gaming
            </h2>
            <p className="text-brand-navy mt-4 whitespace-pre-line text-base">Profitez des meilleurs prix sur les cartes et abonnements PSN, Steam, Xbox et Nintendo en Tunisie. <br />
              Offres limitées sur les codes gaming avec livraison instantanée.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-danger">
            <Clock3 className="size-4" />
            Expire:
            {["01", "02", "16"].map((part, index) => (
              <span
                className="rounded-lg border border-danger/30 bg-danger/12 px-3 py-2 text-danger"
                key={`${part}-${index}`}
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        <div className="scrollbar-none -mx-6 overflow-x-auto px-6 pb-3">
          <div className="flex gap-4">
            {flashProducts.map((product) => (
              <ProductCard
                className="w-[230px] shrink-0"
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
      <SubscriptionsSection />
    </section>
  );
}
