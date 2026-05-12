import { BestSellersSection } from "@/components/site/home/best-sellers-section";
import { CategoriesSection } from "@/components/site/home/categories-section";
import { FaqSection } from "@/components/site/home/faq-section";
import { FlashDealsSection } from "@/components/site/home/flash-deals-section";
import { HeroSection } from "@/components/site/home/hero-section";
import { ProductsSection } from "@/components/site/home/products-section";
import { RecommendedProductsSection } from "@/components/site/home/recommended-products-section";
import { SteamCardsSection } from "@/components/site/home/steam-cards-section";
import { TopGamesSection } from "@/components/site/home/top-games-section";


export default function Home() {
  return (
    <main className="bg-brand-light text-brand-lilac">
      <HeroSection />

      {/* <PromoBannerSection /> */}
      <CategoriesSection />
      <RecommendedProductsSection />
      <FlashDealsSection />

      <SteamCardsSection />
      <ProductsSection />
      <TopGamesSection />
      <BestSellersSection />
      {/* <PaymentMethodsSection /> */}
      <FaqSection />
    </main>
  );
}
