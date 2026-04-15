"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_OPTIONS,
} from "@/constants/admin";
import { calculateDiscountedPrice } from "@/lib/utils/pricing";
import { formatCurrency } from "@/lib/utils/format";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Category, Platform, Product, Region } from "@/types/entities";

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
  platforms: Platform[];
  regions: Region[];
}

interface ProductFormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  galleryText: string;
  categoryId: string;
  platformId: string;
  regionId: string;
  faceValue: string;
  currency: string;
  price: string;
  discountPercent: string;
  sku: string;
  productType: Product["productType"];
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

const defaultFormState: ProductFormState = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  image: "",
  galleryText: "",
  categoryId: "",
  platformId: "",
  regionId: "",
  faceValue: "0",
  currency: "USD",
  price: "0",
  discountPercent: "0",
  sku: "",
  productType: "gift_card",
  isFeatured: false,
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

function parseGalleryText(value: string) {
  return [...new Set(value.split(/\n|,/).map((item) => item.trim()).filter(Boolean))];
}

function buildGalleryText(gallery: string[]) {
  return gallery.join("\n");
}

export function ProductsManager({
  initialProducts,
  categories,
  platforms,
  regions,
}: ProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultFormState);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryNameMap = Object.fromEntries(
    categories.map((category) => [category._id, category.name]),
  );
  const platformNameMap = Object.fromEntries(
    platforms.map((platform) => [platform._id, platform.name]),
  );
  const regionNameMap = Object.fromEntries(
    regions.map((region) => [region._id, region.name]),
  );

  const filteredProducts = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.title, product.slug, product.sku, product.shortDescription ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  })();

  const pricePreview = calculateDiscountedPrice(
    Number(form.price) || 0,
    Number(form.discountPercent) || 0,
  );

  function resetForm() {
    setEditingId(null);
    setForm(defaultFormState);
    setError(null);
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      image: product.image ?? "",
      galleryText: buildGalleryText(product.gallery),
      categoryId: product.categoryId,
      platformId: product.platformId,
      regionId: product.regionId,
      faceValue: String(product.faceValue),
      currency: product.currency,
      price: String(product.price),
      discountPercent: String(product.discountPercent),
      sku: product.sku,
      productType: product.productType,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
    });
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        gallery: parseGalleryText(form.galleryText),
        faceValue: Number(form.faceValue),
        price: Number(form.price),
        discountPercent: Number(form.discountPercent),
      };

      const nextProduct = await fetchJson<Product>(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setProducts((current) =>
        editingId
          ? current.map((product) =>
              product._id === editingId ? nextProduct : product,
            )
          : [nextProduct, ...current],
      );

      resetForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      setProducts((current) => current.filter((product) => product._id !== id));
      if (editingId === id) {
        resetForm();
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete product.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Product catalog</CardTitle>
            <CardDescription className="mt-2">
              Build the sellable offer layer while keeping delivery strictly manual.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="md:w-72"
            />
            <Button onClick={resetForm}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Catalog</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-white/6 text-slate-300">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{product.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {PRODUCT_TYPE_LABELS[product.productType]} · {product.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div>{categoryNameMap[product.categoryId] ?? "—"}</div>
                    <div className="mt-1">
                      {platformNameMap[product.platformId] ?? "—"} ·{" "}
                      {regionNameMap[product.regionId] ?? "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="text-white">
                      {formatCurrency(product.finalPrice, product.currency)}
                    </div>
                    <div className="mt-1 text-slate-500">
                      Base {formatCurrency(product.price, product.currency)} ·{" "}
                      {product.discountPercent}% off
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={product.isActive ? "success" : "muted"}>
                        {product.isActive ? "Active" : "Hidden"}
                      </Badge>
                      {product.isFeatured ? <Badge>Featured</Badge> : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => startEdit(product)}
                        className="px-3"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(product._id)}
                        className="px-3 text-rose-300 hover:text-rose-200"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    No products match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit product" : "Create product"}</CardTitle>
          <CardDescription className="mt-2">
            This admin flow models a manual supplier purchase and manual email
            delivery workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="PlayStation Store $50 Gift Card"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Slug
                </label>
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  placeholder="playstation-store-50-card"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  SKU
                </label>
                <Input
                  value={form.sku}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="PSN-US-50"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Short description
                </label>
                <Input
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      shortDescription: event.target.value,
                    }))
                  }
                  placeholder="US wallet top-up delivered manually by email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Long product description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Primary image URL
                </label>
                <Input
                  value={form.image}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, image: event.target.value }))
                  }
                  placeholder="https://cdn.example.com/products/psn-50.png"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Gallery URLs
                </label>
                <Textarea
                  value={form.galleryText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      galleryText: event.target.value,
                    }))
                  }
                  placeholder="One URL per line"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Category
                </label>
                <Select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Platform
                </label>
                <Select
                  value={form.platformId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      platformId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform._id} value={platform._id}>
                      {platform.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Region
                </label>
                <Select
                  value={form.regionId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      regionId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Product type
                </label>
                <Select
                  value={form.productType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      productType: event.target.value as Product["productType"],
                    }))
                  }
                >
                  {PRODUCT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {PRODUCT_TYPE_LABELS[option]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Face value
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.faceValue}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      faceValue: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Currency
                </label>
                <Input
                  value={form.currency}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      currency: event.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Price
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Discount %
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.discountPercent}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      discountPercent: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="rounded-2xl border border-sky-400/12 bg-sky-400/8 px-4 py-3 text-sm text-slate-300">
                Final price preview
                <div className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(pricePreview, form.currency || "USD")}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  SEO title
                </label>
                <Input
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      seoTitle: event.target.value,
                    }))
                  }
                  placeholder="Optional SEO title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  SEO description
                </label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      seoDescription: event.target.value,
                    }))
                  }
                  placeholder="Optional SEO description"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                <Checkbox
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isFeatured: event.target.checked,
                    }))
                  }
                />
                Featured placement
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                <Checkbox
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Product is active
              </label>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update product"
                    : "Create product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
