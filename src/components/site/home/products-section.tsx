import { products } from "@/components/site/home/home-data";

import { FlashDealsCarousel } from "./flash-deals-carousel";
import Link from "next/link";
import { IoGameController } from "react-icons/io5";

export function ProductsSection() {
  return (
    <section className=" py-16" id="products">
      <div className="mx-auto max-w-[1200px] px-6">

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase text-brand-dark">
              {"// GAMING PC"}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
              Gaming PC en Tunisie – Jeux, clés steam et recharges instantanées

            </h2>

            <p className="text-brand-navy mt-4 whitespace-pre-line text-base">
              {"Accédez à un large catalogue de jeux PC et clés digitales pour vos plateformes préférées. Rechargez votre compte et activez vos jeux en toute simplicité avec une livraison immédiate et paiement en dinars tunisiens."}
            </p>

          </div>



        </div>

        <FlashDealsCarousel products={products} />
        <div className="mt-8 flex justify-center">
          <Link
            href="#products"
            className="inline-flex h-[53px] w-full max-w-[436px] items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-[22px] pb-[14px] pt-[11px] text-center font-heading text-sm font-bold text-[#03030A]  transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(243,252,255,0.58)]"
          >
            <IoGameController className="size-6 shrink-0" />
            <span>
              Voir les cartes steam jeux et recharges PC

            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
