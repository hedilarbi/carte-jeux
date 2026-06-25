import FilterSection from "@/components/site/products/FilterSection";
import MainSection from "@/components/site/products/MainSection";
import { catalogService } from "@/services/catalog.service";

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const content = await catalogService.getProductsPageContent({
    max: readSearchParam(params.max),
    min: readSearchParam(params.min),
    platform: params.platform,
    q: readSearchParam(params.q),
    region: params.region,
    search: readSearchParam(params.search),
    sort: readSearchParam(params.sort),
    type: params.type,
  });

  return (
    <main className="bg-brand-light text-brand-lilac">
      <div className="mx-auto flex w-full max-w-[1350px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-start">
        <FilterSection
          platforms={content.filters.platforms}
          regions={content.filters.regions}
          selected={content.selected}
          types={content.filters.types}
        />
        <MainSection content={content} />
      </div>
    </main>
  );
}
