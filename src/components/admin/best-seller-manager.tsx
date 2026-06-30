"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/utils/fetch-json";
import { formatProductPrice } from "@/lib/utils/pricing";
import type { BestSellerItem, Product } from "@/types/entities";

interface BestSellerManagerProps {
  initialItems: BestSellerItem[];
  products: Product[];
}

function productIdOf(item: BestSellerItem) {
  return String(item.productId);
}

function sortBestSellerItems(items: BestSellerItem[]) {
  return [...items]
    .sort((firstItem, secondItem) => {
      const firstOrder = firstItem.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = secondItem.sortOrder ?? Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return firstItem.createdAt.localeCompare(secondItem.createdAt);
    })
    .map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
}

function moveBestSellerItem(
  items: BestSellerItem[],
  draggedProductId: string,
  targetProductId: string,
) {
  const draggedIndex = items.findIndex(
    (item) => productIdOf(item) === draggedProductId,
  );
  const targetIndex = items.findIndex(
    (item) => productIdOf(item) === targetProductId,
  );

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(draggedIndex, 1);

  if (!draggedItem) {
    return items;
  }

  nextItems.splice(targetIndex, 0, draggedItem);

  return sortBestSellerItems(nextItems);
}

export function BestSellerManager({
  initialItems,
  products,
}: BestSellerManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(() => sortBestSellerItems(initialItems));
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedProductIds = useMemo(
    () => new Set(items.map((item) => productIdOf(item))),
    [items],
  );
  const availableProducts = useMemo(
    () =>
      products
        .filter((product) => !selectedProductIds.has(product._id))
        .sort((firstProduct, secondProduct) =>
          firstProduct.title.localeCompare(secondProduct.title),
        ),
    [products, selectedProductIds],
  );
  const filteredAvailableProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    if (!query) {
      return availableProducts.slice(0, 12);
    }

    return availableProducts
      .filter((product) =>
        [product.title, product.sku, product.slug]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 12);
  }, [availableProducts, productSearch]);
  const selectedProduct = selectedProductId
    ? products.find((product) => product._id === selectedProductId)
    : undefined;

  async function persistItems(
    nextItems: BestSellerItem[],
    previousItems: BestSellerItem[],
  ) {
    setIsSaving(true);
    setError(null);

    try {
      const savedItems = await fetchJson<BestSellerItem[]>(
        "/api/admin/best-seller",
        {
          method: "PATCH",
          body: JSON.stringify({
            productIds: nextItems.map((item) => productIdOf(item)),
          }),
        },
      );

      setItems(sortBestSellerItems(savedItems));
      router.refresh();
    } catch (saveError) {
      setItems(previousItems);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d'enregistrer la liste best seller.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdd() {
    const product = products.find(
      (candidateProduct) => candidateProduct._id === selectedProductId,
    );

    if (!product || selectedProductIds.has(product._id) || isSaving) {
      return;
    }

    const previousItems = items;
    const now = new Date().toISOString();
    const nextItems = sortBestSellerItems([
      ...items,
      {
        _id: `pending-${product._id}`,
        createdAt: now,
        product,
        productId: product._id,
        sortOrder: items.length + 1,
        updatedAt: now,
      },
    ]);

    setSelectedProductId("");
    setProductSearch("");
    setIsProductSearchOpen(false);
    setItems(nextItems);
    await persistItems(nextItems, previousItems);
  }

  async function handleRemove(productId: string) {
    if (isSaving) {
      return;
    }

    const previousItems = items;
    const nextItems = sortBestSellerItems(
      items.filter((item) => productIdOf(item) !== productId),
    );

    setItems(nextItems);
    await persistItems(nextItems, previousItems);
  }

  function handleDragStart(
    event: React.DragEvent<HTMLTableRowElement>,
    productId: string,
  ) {
    if (isSaving) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", productId);
    setDraggedProductId(productId);
  }

  function handleDragOver(event: React.DragEvent<HTMLTableRowElement>) {
    if (!draggedProductId || isSaving) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(
    event: React.DragEvent<HTMLTableRowElement>,
    targetProductId: string,
  ) {
    event.preventDefault();

    const draggedId =
      draggedProductId || event.dataTransfer.getData("text/plain") || null;

    if (!draggedId || draggedId === targetProductId || isSaving) {
      setDraggedProductId(null);
      return;
    }

    const previousItems = items;
    const nextItems = moveBestSellerItem(items, draggedId, targetProductId);

    setDraggedProductId(null);

    if (nextItems === items) {
      return;
    }

    setItems(nextItems);
    await persistItems(nextItems, previousItems);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Liste best seller</CardTitle>
          <CardDescription className="mt-2">
            Sélectionnez les produits à afficher sur l&apos;accueil, puis
            glissez-déposez les lignes pour modifier l&apos;ordre.
          </CardDescription>
        </div>

        <div className="grid w-full gap-3 lg:w-[520px]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                disabled={isSaving || availableProducts.length === 0}
                onChange={(event) => {
                  setProductSearch(event.target.value);
                  setSelectedProductId("");
                  setIsProductSearchOpen(true);
                }}
                onFocus={() => setIsProductSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsProductSearchOpen(false);
                  }
                }}
                placeholder={
                  availableProducts.length === 0
                    ? "Tous les produits actifs sont sélectionnés"
                    : "Rechercher par nom, SKU ou slug"
                }
                value={productSearch}
              />
              {isProductSearchOpen &&
              (productSearch.trim() || filteredAvailableProducts.length > 0) ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
                  {filteredAvailableProducts.map((product) => {
                    const isSelected = product._id === selectedProductId;

                    return (
                      <button
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-slate-100"
                        }`}
                        disabled={isSaving}
                        key={product._id}
                        onClick={() => {
                          setSelectedProductId(product._id);
                          setProductSearch(`${product.title} · ${product.sku}`);
                          setIsProductSearchOpen(false);
                        }}
                        type="button"
                      >
                        <ImagePreview
                          alt={product.title}
                          className="size-10 shrink-0 rounded-lg"
                          emptyLabel="—"
                          src={product.image}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {product.title}
                          </span>
                          <span
                            className={`mt-0.5 block truncate font-mono text-xs ${
                              isSelected
                                ? "text-primary-foreground/70"
                                : "text-slate-500"
                            }`}
                          >
                            {product.sku} · {product.slug}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {filteredAvailableProducts.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-slate-500">
                      Aucun produit trouvé.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Button
              disabled={!selectedProductId || isSaving}
              onClick={handleAdd}
            >
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
          {selectedProduct ? (
            <p className="text-xs font-medium text-slate-500">
              Produit sélectionné : {selectedProduct.title}
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        {error ? (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Ordre</th>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const product = item.product;
              const productId = productIdOf(item);

              return (
                <tr
                  className={`border-b border-border text-slate-700 transition ${
                    draggedProductId === productId ? "opacity-45" : ""
                  } ${isSaving ? "" : "cursor-grab"}`}
                  draggable={!isSaving}
                  key={productId}
                  onDragEnd={() => setDraggedProductId(null)}
                  onDragOver={handleDragOver}
                  onDragStart={(event) => handleDragStart(event, productId)}
                  onDrop={(event) => handleDrop(event, productId)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <GripVertical
                        className={`size-4 ${isSaving ? "opacity-30" : ""}`}
                      />
                      <span className="font-mono text-xs">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        alt={product?.title ?? "Produit best seller"}
                        className="size-12 shrink-0 rounded-xl"
                        emptyLabel="—"
                        src={product?.image}
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {product?.title ?? "Produit introuvable"}
                        </div>
                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {product?.slug ?? productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {product?.sku ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">
                    {product
                      ? `${formatProductPrice(product.finalPrice)} ${product.currency}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product?.isActive ? "success" : "muted"}>
                      {product?.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        className="px-3 text-rose-600 hover:text-rose-700"
                        disabled={isSaving}
                        onClick={() => handleRemove(productId)}
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-slate-500"
                  colSpan={6}
                >
                  Aucun produit best seller sélectionné.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
