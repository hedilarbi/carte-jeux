import { products } from "@/components/site/home/home-data";
import { ProductCard } from "@/components/site/home/product-card";
import { SectionHeading } from "@/components/site/home/section-heading";

export function BestSellersSection() {
  return (
    <section className=" py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          actionHref="#products"
          actionLabel="Voir tout"
          eyebrow="// Best sellers"
          title="E-cartes les plus vendues"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
