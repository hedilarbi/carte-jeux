import type { Metadata } from "next";
import CategoryPageTemplate, {
  generateCategoryMetadata,
} from "@/components/site/categories/CategoryPageTemplate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryMetadata(slug, true);
}

export default async function PlateformeCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryPageTemplate slug={slug} isPlateforme={true} />;
}
