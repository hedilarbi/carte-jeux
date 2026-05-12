import { products } from "@/components/site/home/home-data";
import { ProductCard } from "@/components/site/home/product-card";

export function ProductsSection() {
  return (
    <section className=" py-16" id="products">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase text-brand-dark">
              {"// Catalogue"}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
              Tous les produits
            </h2>
          </div>

          <select className="h-11 rounded-2xl border border-brand-ice/14 bg-brand-navy/76 px-4 font-mono text-xs text-brand-lilac outline-none focus:border-brand-lavender/50">
            <option>Plus populaires</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
            <option>Nouveautés</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
