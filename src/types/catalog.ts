export interface CatalogCategoryFilter {
  id: string;
  image?: string;
  isPlateforme: boolean;
  label: string;
  slug: string;
}

export interface CatalogRegionFilter {
  code: string;
  id: string;
  label: string;
}

export interface CatalogSelectedFilters {
  max?: string;
  min?: string;
  q?: string;
  region?: string;
  search?: string;
  sort: string;
}

export interface CatalogProduct {
  id: string;
  image?: string;
  originalPrice?: string;
  platform: string;
  platformImage?: string;
  platformSlug?: string;
  price: string;
  region: string;
  slug: string;
  title: string;
}

export interface CatalogPageContent {
  activeCategory?: CatalogCategoryFilter;
  filters: {
    platforms: CatalogCategoryFilter[];
    regions: CatalogRegionFilter[];
    types: CatalogCategoryFilter[];
  };
  products: CatalogProduct[];
  selected: CatalogSelectedFilters;
  totalItems: number;
}
