import { products } from "@/components/site/home/home-data";
import { RecommendedCard } from "./RecommendedCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IoGameController } from "react-icons/io5";

export function RecommendedProductsSection() {
  return (
    <section className="py-16" id="recommended">
      <div className="mx-auto max-w-[1400px] lg:ml-[100px] lg:mr-[50px] px-6">

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase text-white">
              {"// GAMING MOBILE"}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-white">
              Gaming mobile & recharges jeux en ligne en Tunisie
            </h2>

            <p className="mt-4 whitespace-pre-line text-base text-brand-titanic-white">
              {"Rechargez vos jeux mobiles préférés : Free Fire, PUBG Mobile, Call of Duty Mobile.\nAchetez vos crédits rapidement avec paiement en TND et activation immédiate."}
            </p>

          </div>

          <Link
            className="font-mono text-xs font-bold uppercase text-brand-lavender transition hover:text-brand-lilac"
            href="#products"
          >
            <span className="inline-flex items-center gap-1">
              Voir tout
              <ArrowRight className="size-3" />
            </span>
          </Link>

        </div>

        <div className="scrollbar-none -mx-6 mt-10 overflow-x-auto px-6 pb-3">
          <div className="flex items-start gap-4">
            {products.slice(0, 8).map((product) => (
              <RecommendedCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="#products"
            className="inline-flex h-[53px] w-full max-w-[436px] items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-[22px] pb-[14px] pt-[11px] text-center font-heading text-sm font-bold text-[#03030A] shadow-[0_4px_20px_rgba(243,252,255,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(243,252,255,0.58)]"
          >
            <IoGameController className="size-6 shrink-0" />
            <span>
              Accéder aux recharges mobiles
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
