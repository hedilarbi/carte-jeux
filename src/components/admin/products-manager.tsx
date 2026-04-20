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
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_TYPE_LABELS } from "@/constants/admin";
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
  categoryId: string;
  platformId: string;
  regionIds: string[];
  price: string;
  discountPercent: string;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

const defaultFormState: ProductFormState = {
  title: "",
  slug: "",
  categoryId: "",
  platformId: "",
  regionIds: [],
  price: "0",
  discountPercent: "0",
  sku: "",
  isFeatured: false,
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

const PRODUCT_CURRENCY = "DTN";
const DEFAULT_PRODUCT_TYPE: Product["productType"] = "gift_card";

function getProductRegionIds(product: Product) {
  if (product.regionIds?.length) {
    return product.regionIds;
  }

  return product.regionId ? [product.regionId] : [];
}

function readImagePreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Impossible de lire l'image sélectionnée."));
    };
    reader.readAsDataURL(file);
  });
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setIsFormOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(defaultFormState);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setIsFormOpen(true);
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      title: product.title,
      slug: product.slug,
      categoryId: product.categoryId,
      platformId: product.platformId,
      regionIds: getProductRegionIds(product),
      price: String(product.price),
      discountPercent: String(product.discountPercent),
      sku: product.sku,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
    });
    setImageFile(null);
    setImagePreview(product.image ?? null);
    setError(null);
    setIsFormOpen(true);
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImageFile(file);
      setImagePreview(await readImagePreview(file));
    } catch {
      setError("Impossible de lire l'image principale sélectionnée.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.regionIds.length === 0) {
      setError("Sélectionnez au moins une région.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.set("title", form.title);
      payload.set("slug", form.slug);
      payload.set("categoryId", form.categoryId);
      payload.set("platformId", form.platformId);
      form.regionIds.forEach((regionId) => {
        payload.append("regionIds", regionId);
      });
      payload.set("currency", PRODUCT_CURRENCY);
      payload.set("price", form.price);
      payload.set("discountPercent", form.discountPercent);
      payload.set("sku", form.sku);
      payload.set("isFeatured", String(form.isFeatured));
      payload.set("isActive", String(form.isActive));
      payload.set("seoTitle", form.seoTitle);
      payload.set("seoDescription", form.seoDescription);

      if (!editingId) {
        payload.set("faceValue", form.price || "0");
        payload.set("productType", DEFAULT_PRODUCT_TYPE);
      }

      if (imageFile) {
        payload.set("image", imageFile);
      }

      const nextProduct = await fetchJson<Product>(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          body: payload,
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
          : "Impossible d'enregistrer le produit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce produit ?")) {
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
          : "Impossible de supprimer le produit.",
      );
    }
  }

  function toggleRegion(regionId: string) {
    setForm((current) => {
      const isSelected = current.regionIds.includes(regionId);

      return {
        ...current,
        regionIds: isSelected
          ? current.regionIds.filter(
              (currentRegionId) => currentRegionId !== regionId,
            )
          : [...current.regionIds, regionId],
      };
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Catalogue produits</CardTitle>
            <CardDescription className="mt-2">
              Construisez la couche d’offre vendable tout en gardant une livraison strictement manuelle.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher des produits"
              className="md:w-72"
            />
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catalogue</th>
                <th className="px-6 py-4">Tarification</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-white/6 text-slate-300">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        alt={`Image ${product.title}`}
                        className="size-12 shrink-0 rounded-xl"
                        emptyLabel="—"
                        src={product.image}
                      />
                      <div>
                        <div className="font-medium text-white">
                          {product.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {PRODUCT_TYPE_LABELS[product.productType]} ·{" "}
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div>{categoryNameMap[product.categoryId] ?? "—"}</div>
                    <div className="mt-1">
                      {platformNameMap[product.platformId] ?? "—"} ·{" "}
                      {getProductRegionIds(product)
                        .map((regionId) => regionNameMap[regionId])
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="text-white">
                      {formatCurrency(product.finalPrice, product.currency)}
                    </div>
                    <div className="mt-1 text-slate-500">
                      Prix de base {formatCurrency(product.price, product.currency)} ·{" "}
                      remise de {product.discountPercent} %
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={product.isActive ? "success" : "muted"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      {product.isFeatured ? <Badge>Mis en avant</Badge> : null}
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
                    Aucun produit ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Ce flux admin modélise un achat manuel chez le fournisseur et une livraison manuelle par e-mail."
        isOpen={isFormOpen}
        onClose={resetForm}
        size="wide"
        title={editingId ? "Modifier le produit" : "Créer un produit"}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Image principale
              </label>
              <ImagePreview
                alt="Aperçu de l'image principale"
                className="mb-3 aspect-[4/5]"
                emptyLabel="Aucune image principale sélectionnée"
                src={imagePreview}
              />
              <Input
                accept="image/*"
                className="cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-sky-400/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-200"
                name="image"
                onChange={handleImageChange}
                type="file"
              />
              <p className="mt-2 text-xs text-slate-500">
                Si aucune nouvelle image n&apos;est choisie en édition,
                l&apos;image existante est conservée.
              </p>
            </div>

            <div className="grid content-start gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Titre
                </label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Carte cadeau PlayStation Store 50 $"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Slug
                  </label>
                  <Input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
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
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                    placeholder="PSN-US-50"
                    required
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
                  Mise en avant
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
                  Le produit est actif
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Catégorie
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
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Plateforme
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
                <option value="">Sélectionner une plateforme</option>
                {platforms.map((platform) => (
                  <option key={platform._id} value={platform._id}>
                    {platform.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Prix
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
                Remise %
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
              Aperçu du prix final · DTN
              <div className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(pricePreview, PRODUCT_CURRENCY)}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Régions
            </label>
            <div className="grid gap-2 rounded-2xl border border-white/8 bg-slate-950/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((region) => (
                <label
                  key={region._id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  <Checkbox
                    checked={form.regionIds.includes(region._id)}
                    onChange={() => toggleRegion(region._id)}
                  />
                  <span>{region.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sélectionnez une ou plusieurs régions où ce produit peut être
              vendu.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Titre SEO
              </label>
              <Input
                value={form.seoTitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seoTitle: event.target.value,
                  }))
                }
                placeholder="Titre SEO optionnel"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description SEO
              </label>
              <Textarea
                value={form.seoDescription}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seoDescription: event.target.value,
                  }))
                }
                placeholder="Description SEO optionnelle"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour le produit"
                  : "Créer le produit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
