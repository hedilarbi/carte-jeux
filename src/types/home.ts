export type HomeProductBadge = "instant" | "hot" | "sale" | "new";

export interface ProductPreview {
  id: number | string;
  slug?: string;
  platform: string;
  name: string;
  price: string;
  originalPrice?: string;
  currency?: string;
  image?: string;
  platformImage?: string;
  platformSlug?: string;
  icon: string;
  gradient: string;
  badges: HomeProductBadge[];
  reviews: string;
}

export interface HomeCategoryPreview {
  id: string;
  label: string;
  slug: string;
  image?: string;
  isPlateforme: boolean;
  sortOrder: number;
}

export type HomeProductSectionKey =
  | "jeuMobile"
  | "psn"
  | "xbox"
  | "nintendo"
  | "gamingPc";

export interface HomeProductSection {
  key: HomeProductSectionKey;
  categorySlug: string;
  products: ProductPreview[];
}

export interface HomePageContent {
  categories: HomeCategoryPreview[];
  productSections: HomeProductSection[];
}
