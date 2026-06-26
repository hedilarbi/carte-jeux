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
  platforms: string[];
  regions: string[];
  search?: string;
  sort: string;
  types: string[];
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

export interface CatalogPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  totalPages: number;
}

export interface CatalogPageContent {
  activeCategory?: CatalogCategoryFilter;
  activeFilters: {
    platforms: CatalogCategoryFilter[];
    regions: CatalogRegionFilter[];
    types: CatalogCategoryFilter[];
  };
  filters: {
    platforms: CatalogCategoryFilter[];
    regions: CatalogRegionFilter[];
    types: CatalogCategoryFilter[];
  };
  pagination: CatalogPagination;
  products: CatalogProduct[];
  selected: CatalogSelectedFilters;
  totalItems: number;
}
