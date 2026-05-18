import FilterSection from "@/components/site/products/FilterSection";
import MainSection from "@/components/site/products/MainSection";

export default function ProductsPage() {
  return (
    <main className="bg-brand-light text-brand-lilac">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-start">
        <FilterSection />
        <MainSection />
      </div>
    </main>
  );
}
