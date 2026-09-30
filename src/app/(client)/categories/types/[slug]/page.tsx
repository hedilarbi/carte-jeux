import type { Metadata } from "next";
import CategoryPageTemplate, {
  generateCategoryMetadata,
} from "@/components/site/categories/CategoryPageTemplate";
import type { ListingSearchParams } from "@/lib/utils/catalog-seo";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryMetadata(slug, false, await searchParams);
}

export default async function TypeCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  return (
    <CategoryPageTemplate
      slug={slug}
      isPlateforme={false}
      searchParams={await searchParams}
    />
  );
}
