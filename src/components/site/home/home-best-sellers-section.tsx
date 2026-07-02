import Link from "next/link";
import { IoGameController } from "react-icons/io5";

import { FlashDealsCarousel } from "@/components/site/home/flash-deals-carousel";
import type { ProductPreview } from "@/types/home";

export function HomeBestSellersSection({
  products,
}: {
  products: ProductPreview[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-light py-0 md:py-16" id="best-sellers">
      <div className="mx-auto max-w-[1350px] px-6">
        <div className="mb-7">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-purple-deep">
            {"// BEST SELLER"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
            Les meilleurs vendus
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-base text-brand-navy">
            Retrouvez les produits les plus demandés, sélectionnés par notre
            équipe.
          </p>
        </div>

        <FlashDealsCarousel highlightOriginalPrice products={products} />

        <div className="mt-8 flex justify-center">
          <Link
            className="inline-flex h-[53px] w-full max-w-[436px] items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-[22px] pb-[14px] pt-[11px] text-center font-heading text-sm font-bold text-[#03030A] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(243,252,255,0.58)]"
            href="/produits"
          >
            <IoGameController className="size-6 shrink-0" />
            <span>Voir tous les produits</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
