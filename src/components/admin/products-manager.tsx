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
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_TYPE_LABELS } from "@/constants/admin";
import { calculateDiscountedPrice } from "@/lib/utils/pricing";
import { formatCurrency } from "@/lib/utils/format";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Category, Product, ProductFaqItem, Region } from "@/types/entities";

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
  platformCategories: Category[];
  regions: Region[];
}

interface ProductCsvImportResult {
  createdCount: number;
  errors: Array<{
    line: number;
    message: string;
  }>;
  products: Product[];
}

interface ProductFormState {
  title: string;
  slug: string;
  description: string;
  categoryIds: string[];
  platformId: string;
  regionIds: string[];
  price: string;
  discountPercent: string;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  faqItems: ProductFaqItem[];
  seoTitle: string;
  seoDescription: string;
}

const defaultFormState: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  categoryIds: [],
  platformId: "",
  regionIds: [],
  price: "0",
  discountPercent: "0",
  sku: "",
  isFeatured: false,
  isActive: true,
  faqItems: [],
  seoTitle: "",
  seoDescription: "",
};

const PRODUCT_CURRENCY = "DTN";
const DEFAULT_PRODUCT_TYPE: Product["productType"] = "gift_card";
const CSV_TEMPLATE = [
  "title;sku;category_slugs;platform_slug;region_codes;face_value;currency;price;product_type;discount_percent;is_featured;is_active;slug;short_description;description;image;gallery;seo_title;seo_description",
  "Carte PlayStation Store 50 USD;PSN-US-50;type-produit-slug;platforme-slug;US;50;USD;50;gift_card;0;false;true;playstation-store-50-us;Description courte;Description complète;https://example.com/image.jpg;https://example.com/image-1.jpg|https://example.com/image-2.jpg;Titre SEO;Description SEO",
].join("\n");

function getProductCategoryIds(product: Product) {
  if (product.categoryIds?.length) {
    return product.categoryIds;
  }

  return product.categoryId ? [product.categoryId] : [];
}

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
  platformCategories,
  regions,
}: ProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImportError, setCsvImportError] = useState<string | null>(null);
  const [csvImportResult, setCsvImportResult] =
    useState<ProductCsvImportResult | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryNameMap = Object.fromEntries(
    categories.map((category) => [category._id, category.name]),
  );
  const platformNameMap = Object.fromEntries(
    platformCategories.map((category) => [category._id, category.name]),
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
      [
        product.title,
        product.slug,
        product.sku,
        product.shortDescription ?? "",
        product.description ?? "",
      ]
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

  function resetCsvImport() {
    setCsvFile(null);
    setCsvImportError(null);
    setCsvImportResult(null);
    setIsCsvImportOpen(false);
  }

  function startCsvImport() {
    setCsvFile(null);
    setCsvImportError(null);
    setCsvImportResult(null);
    setIsCsvImportOpen(true);
  }

  function downloadCsvTemplate() {
    const blob = new Blob([CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modele-import-produits.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleCsvImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCsvImportError(null);
    setCsvImportResult(null);

    if (!csvFile) {
      setCsvImportError("Sélectionnez un fichier CSV.");
      return;
    }

    setIsImportingCsv(true);

    try {
      const payload = new FormData();
      payload.set("file", csvFile);

      const result = await fetchJson<ProductCsvImportResult>(
        "/api/admin/products/import",
        {
          method: "POST",
          body: payload,
        },
      );

      setCsvImportResult(result);

      if (result.createdCount > 0) {
        setProducts((current) => [...result.products, ...current]);
        router.refresh();
      }
    } catch (importError) {
      setCsvImportError(
        importError instanceof Error
          ? importError.message
          : "Impossible d’importer le fichier CSV.",
      );
    } finally {
      setIsImportingCsv(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description ?? "",
      categoryIds: getProductCategoryIds(product),
      platformId: product.platformId,
      regionIds: getProductRegionIds(product),
      price: String(product.price),
      discountPercent: String(product.discountPercent),
      sku: product.sku,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      faqItems: product.faqItems ?? [],
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

    if (form.categoryIds.length === 0) {
      setError("Sélectionnez au moins une catégorie.");
      return;
    }

    if (form.regionIds.length === 0) {
      setError("Sélectionnez au moins une région.");
      return;
    }

    if (
      form.faqItems.some(
        (item) =>
          (item.question.trim() && !item.answer.trim()) ||
          (!item.question.trim() && item.answer.trim()),
      )
    ) {
      setError("Chaque question FAQ doit contenir une question et une réponse.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.set("title", form.title);
      payload.set("slug", form.slug);
      payload.set("description", form.description);
      payload.set("categoryId", form.categoryIds[0]);
      form.categoryIds.forEach((categoryId) => {
        payload.append("categoryIds", categoryId);
      });
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
      payload.set(
        "faqItems",
        JSON.stringify(
          form.faqItems
            .map((item) => ({
              question: item.question.trim(),
              answer: item.answer.trim(),
            }))
            .filter((item) => item.question && item.answer),
        ),
      );
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

  function toggleCategory(categoryId: string) {
    setForm((current) => {
      const isSelected = current.categoryIds.includes(categoryId);

      return {
        ...current,
        categoryIds: isSelected
          ? current.categoryIds.filter(
              (currentCategoryId) => currentCategoryId !== categoryId,
            )
          : [...current.categoryIds, categoryId],
      };
    });
  }

  function addFaqItem() {
    setForm((current) => ({
      ...current,
      faqItems: [...current.faqItems, { answer: "", question: "" }],
    }));
  }

  function updateFaqItem(
    index: number,
    field: keyof ProductFaqItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeFaqItem(index: number) {
    setForm((current) => ({
      ...current,
      faqItems: current.faqItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Catalogue produits</CardTitle>
            <CardDescription className="mt-2">
              Construisez la couche d’offre vendable tout en gardant une livraison strictement manuelle.
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher des produits"
              className="md:w-72"
            />
            <Button onClick={startCsvImport} type="button" variant="outline">
              Importer CSV
            </Button>
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
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
                <tr key={product._id} className="border-b border-border text-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        alt={`Image ${product.title}`}
                        className="size-12 shrink-0 rounded-xl"
                        emptyLabel="—"
                        src={product.image}
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {product.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {PRODUCT_TYPE_LABELS[product.productType]} ·{" "}
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>
                      {getProductCategoryIds(product)
                        .map((categoryId) => categoryNameMap[categoryId])
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                    <div className="mt-1">
                      {platformNameMap[product.platformId] ?? "—"} ·{" "}
                      {getProductRegionIds(product)
                        .map((regionId) => regionNameMap[regionId])
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="text-foreground">
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
                        className="px-3 text-rose-600 hover:text-rose-700"
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
                className="cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-sky-400/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
                <label className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">
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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type
            </label>
            <div className="grid gap-2 rounded-2xl border border-border bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category._id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Checkbox
                    checked={form.categoryIds.includes(category._id)}
                    onChange={() => toggleCategory(category._id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sélectionnez un ou plusieurs types. La première sélectionnée sert
              de catégorie principale pour les anciens écrans.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Plateforme
            </label>
            <div className="grid gap-2 rounded-2xl border border-border bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {platformCategories.map((platform) => {
                const isSelected = form.platformId === platform._id;

                return (
                  <label
                    key={platform._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      isSelected
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    <Checkbox
                      type="radio"
                      name="platformId"
                      checked={isSelected}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          platformId: platform._id,
                        }))
                      }
                    />
                    <span>{platform.name}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Ces options viennent des catégories cochées comme plateforme.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
            <div className="rounded-2xl border border-sky-400/12 bg-sky-400/8 px-4 py-3 text-sm text-slate-700">
              Aperçu du prix final · DTN
              <div className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(pricePreview, PRODUCT_CURRENCY)}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Régions
            </label>
            <div className="grid gap-2 rounded-2xl border border-border bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((region) => (
                <label
                  key={region._id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
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
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description produit
              </label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description visible sur la page produit"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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

          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  FAQ produit
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Ajoutez les questions/réponses affichées sur la page du
                  produit.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addFaqItem}>
                <Plus className="size-4" />
                Ajouter une question
              </Button>
            </div>

            {form.faqItems.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {form.faqItems.map((item, index) => (
                  <div
                    className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                    key={`faq-${index}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Question {index + 1}
                      </p>
                      <Button
                        aria-label={`Supprimer la question ${index + 1}`}
                        className="px-3 text-rose-600 hover:text-rose-700"
                        onClick={() => removeFaqItem(index)}
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Question
                        </label>
                        <Input
                          maxLength={240}
                          onChange={(event) =>
                            updateFaqItem(index, "question", event.target.value)
                          }
                          placeholder="Ex: Comment recevoir ce produit ?"
                          value={item.question}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Réponse
                        </label>
                        <Textarea
                          maxLength={1200}
                          onChange={(event) =>
                            updateFaqItem(index, "answer", event.target.value)
                          }
                          placeholder="Réponse affichée dans la FAQ produit"
                          value={item.answer}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                Aucune question FAQ ajoutée pour ce produit.
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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

      <Modal
        description="Les catégories et plateformes sont identifiées par leurs slugs, les régions par leurs codes. Aucun produit n’est créé tant que le fichier contient une erreur."
        isOpen={isCsvImportOpen}
        onClose={resetCsvImport}
        size="wide"
        title="Importer des produits CSV"
      >
        <form className="space-y-5" onSubmit={handleCsvImport}>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Format du fichier</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  CSV UTF-8, séparé par des virgules ou des points-virgules.
                  Utilisez le caractère <code>|</code> pour plusieurs types,
                  régions ou images de galerie.
                </p>
              </div>
              <Button
                onClick={downloadCsvTemplate}
                type="button"
                variant="outline"
              >
                Télécharger le modèle
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs leading-5 text-slate-600">
              Colonnes obligatoires : title, sku, category_slugs, platform_slug,
              region_codes, face_value, currency, price, product_type.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Valeurs autorisées pour <code>product_type</code> : gift_card,
              subscription, game_credit. Les booléens acceptent true/false,
              oui/non ou 1/0. Les colonnes restantes sont optionnelles.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fichier CSV
            </label>
            <Input
              accept=".csv,text/csv"
              className="cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-sky-400/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700"
              onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
              type="file"
            />
            <p className="mt-2 text-xs text-slate-500">
              Maximum 200 produits et 2 Mo par fichier.
            </p>
          </div>

          {csvImportError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {csvImportError}
            </p>
          ) : null}

          {csvImportResult ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                csvImportResult.errors.length > 0
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <p className="font-medium">
                {csvImportResult.errors.length > 0
                  ? `${csvImportResult.errors.length} erreur(s) détectée(s) : aucun produit créé.`
                  : `${csvImportResult.createdCount} produit(s) créé(s).`}
              </p>
              {csvImportResult.errors.length > 0 ? (
                <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto text-xs leading-5">
                  {csvImportResult.errors.map((item, index) => (
                    <li key={`${item.line}-${index}`}>
                      Ligne {item.line} : {item.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              onClick={resetCsvImport}
              type="button"
              variant="outline"
            >
              Fermer
            </Button>
            <Button disabled={isImportingCsv} type="submit">
              {isImportingCsv ? "Import en cours..." : "Importer les produits"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
