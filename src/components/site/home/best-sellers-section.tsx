import { products } from "@/components/site/home/home-data";
import { ProductCard } from "@/components/site/home/product-card";
import { SectionHeading } from "@/components/site/home/section-heading";
import { FlashDealsCarousel } from "./flash-deals-carousel";
import Link from "next/link";
import { IoGameController } from "react-icons/io5";

export function BestSellersSection() {
  return (
    <section className=" py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase text-brand-dark">
            {"// GAMING PC"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
            Nintendo Switch Tunisie – Cartes eShop & abonnements


          </h2>

          <p className="text-brand-navy mt-4 whitespace-pre-line text-base">
            {"Achetez vos cartes Nintendo eShop en Tunisie et rechargez votre compte Switch en quelques secondes."}
          </p>

        </div>
        <FlashDealsCarousel products={products} />
        <div className="mt-8 flex justify-center">
          <Link
            href="#products"
            className="inline-flex h-[53px] w-full max-w-[436px] items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-[22px] pb-[14px] pt-[11px] text-center font-heading text-sm font-bold text-[#03030A]  transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(243,252,255,0.58)]"
          >
            <IoGameController className="size-6 shrink-0" />
            <span>
              Acheter abonnement et cartes Nintendo

            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
