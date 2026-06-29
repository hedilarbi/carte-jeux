import { connection } from "next/server";

import { BestSellersSection } from "@/components/site/home/best-sellers-section";
import { CategoriesSection } from "@/components/site/home/categories-section";
import { FaqSection } from "@/components/site/home/faq-section";
import { HeroSection } from "@/components/site/home/hero-section";
import { HomeBestSellersSection } from "@/components/site/home/home-best-sellers-section";
import { ProductsSection } from "@/components/site/home/products-section";
import { RecommendedProductsSection } from "@/components/site/home/recommended-products-section";
import { SteamCardsSection } from "@/components/site/home/steam-cards-section";
import { TopGamesSection } from "@/components/site/home/top-games-section";
import { homeService } from "@/services/home.service";
import type { HomeProductSection, HomeProductSectionKey } from "@/types/home";

function findSection(
  sections: Awaited<
    ReturnType<typeof homeService.getHomePageContent>
  >["productSections"],
  key: HomeProductSectionKey,
): HomeProductSection {
  return (
    sections.find((section) => section.key === key) ?? {
      categorySlug: "",
      key,
      products: [],
    }
  );
}

export default async function Home() {
  await connection();

  const home = await homeService.getHomePageContent();
  const jeuMobileSection = findSection(home.productSections, "jeuMobile");
  const psnSection = findSection(home.productSections, "psn");
  const xboxSection = findSection(home.productSections, "xbox");
  const nintendoSection = findSection(home.productSections, "nintendo");
  const gamingPcSection = findSection(home.productSections, "gamingPc");

  return (
    <main className="bg-brand-light text-brand-lilac">
      <HeroSection />

      {/* <PromoBannerSection /> */}
      <CategoriesSection categories={home.categories} />
      <HomeBestSellersSection products={home.bestSellers} />
      <RecommendedProductsSection
        categorySlug={jeuMobileSection.categorySlug}
        products={jeuMobileSection.products}
      />
      <SteamCardsSection
        categorySlug={psnSection.categorySlug}
        products={psnSection.products}
      />
      <TopGamesSection
        categorySlug={xboxSection.categorySlug}
        products={xboxSection.products}
      />
      <BestSellersSection
        categorySlug={nintendoSection.categorySlug}
        products={nintendoSection.products}
      />
      <ProductsSection
        categorySlug={gamingPcSection.categorySlug}
        products={gamingPcSection.products}
      />
      {/* <PaymentMethodsSection /> */}
      <FaqSection />
    </main>
  );
}
