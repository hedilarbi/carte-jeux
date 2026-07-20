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
import type { Category } from "@/types/entities";

interface HomeCategoriesManagerProps {
  categories: Category[];
  initialCategories: Category[];
}

function moveCategory(
  categories: Category[],
  draggedId: string,
  targetId: string,
) {
  const draggedIndex = categories.findIndex(({ _id }) => _id === draggedId);
  const targetIndex = categories.findIndex(({ _id }) => _id === targetId);

  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
    return categories;
  }

  const nextCategories = [...categories];
  const [draggedCategory] = nextCategories.splice(draggedIndex, 1);

  if (!draggedCategory) {
    return categories;
  }

  nextCategories.splice(targetIndex, 0, draggedCategory);
  return nextCategories;
}

export function HomeCategoriesManager({
  categories,
  initialCategories,
}: HomeCategoriesManagerProps) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] =
    useState(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasReachedLimit = selectedCategories.length >= 16;

  const selectedIds = useMemo(
    () => new Set(selectedCategories.map(({ _id }) => _id)),
    [selectedCategories],
  );
  const availableCategories = useMemo(
    () =>
      categories
        .filter(({ _id }) => !selectedIds.has(_id))
        .filter((category) =>
          [category.name, category.slug]
            .join(" ")
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        )
        .slice(0, 12),
    [categories, search, selectedIds],
  );

  async function persist(
    nextCategories: Category[],
    previousCategories: Category[],
  ) {
    setIsSaving(true);
    setError(null);

    try {
      const result = await fetchJson<{
        categories: Category[];
        isConfigured: boolean;
      }>("/api/admin/section-categorie", {
        method: "PATCH",
        body: JSON.stringify({
          categoryIds: nextCategories.map(({ _id }) => _id),
        }),
      });

      setSelectedCategories(result.categories);
      router.refresh();
    } catch (saveError) {
      setSelectedCategories(previousCategories);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d'enregistrer la section catégorie.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdd() {
    const category = categories.find(({ _id }) => _id === selectedCategoryId);

    if (!category || selectedIds.has(category._id) || isSaving) {
      return;
    }

    const previousCategories = selectedCategories;
    const nextCategories = [...selectedCategories, category];
    setSelectedCategories(nextCategories);
    setSelectedCategoryId("");
    setSearch("");
    setIsSearchOpen(false);
    await persist(nextCategories, previousCategories);
  }

  async function handleRemove(categoryId: string) {
    if (isSaving) return;

    const previousCategories = selectedCategories;
    const nextCategories = selectedCategories.filter(
      ({ _id }) => _id !== categoryId,
    );
    setSelectedCategories(nextCategories);
    await persist(nextCategories, previousCategories);
  }

  async function handleDrop(
    event: React.DragEvent<HTMLTableRowElement>,
    targetId: string,
  ) {
    event.preventDefault();
    const sourceId = draggedId || event.dataTransfer.getData("text/plain");

    if (!sourceId || sourceId === targetId || isSaving) return;

    const previousCategories = selectedCategories;
    const nextCategories = moveCategory(selectedCategories, sourceId, targetId);
    setDraggedId(null);

    if (nextCategories === selectedCategories) return;

    setSelectedCategories(nextCategories);
    await persist(nextCategories, previousCategories);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Nos catégories</CardTitle>
          <CardDescription className="mt-2">
            Ajoutez les catégories à mettre en avant, puis glissez-déposez les
            lignes pour changer leur ordre d&apos;affichage.
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[520px]">
          <div className="relative flex-1">
            <Input
              disabled={
                isSaving ||
                hasReachedLimit ||
                selectedIds.size === categories.length
              }
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedCategoryId("");
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={
                hasReachedLimit
                  ? "Limite de 16 catégories atteinte"
                  : "Rechercher une catégorie"
              }
              value={search}
            />
            {isSearchOpen && availableCategories.length > 0 ? (
              <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
                {availableCategories.map((category) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                    key={category._id}
                    onClick={() => {
                      setSelectedCategoryId(category._id);
                      setSearch(category.name);
                      setIsSearchOpen(false);
                    }}
                    type="button"
                  >
                    <ImagePreview
                      alt={category.name}
                      className="size-10 shrink-0 rounded-lg"
                      emptyLabel="—"
                      src={category.image}
                    />
                    <span>
                      <span className="block font-medium">{category.name}</span>
                      <span className="font-mono text-xs text-slate-500">
                        {category.slug}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Button
            disabled={!selectedCategoryId || isSaving || hasReachedLimit}
            onClick={handleAdd}
          >
            <Plus className="size-4" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {error ? (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Ordre</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedCategories.map((category, index) => (
              <tr
                className={`border-b border-border text-slate-700 ${
                  isSaving ? "cursor-wait opacity-60" : "cursor-grab"
                }`}
                draggable={!isSaving}
                key={category._id}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => {
                  if (draggedId && !isSaving) event.preventDefault();
                }}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", category._id);
                  setDraggedId(category._id);
                }}
                onDrop={(event) => handleDrop(event, category._id)}
              >
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 font-mono text-xs text-slate-500">
                    <GripVertical className="size-4" />#{index + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ImagePreview
                      alt={category.name}
                      className="size-11 shrink-0 rounded-xl"
                      emptyLabel="—"
                      src={category.image}
                    />
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="font-mono text-xs text-slate-500">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={category.isPlateforme ? "default" : "muted"}>
                    {category.isPlateforme ? "Plateforme" : "Catégorie"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    className="px-3 text-rose-600 hover:text-rose-700"
                    disabled={isSaving}
                    onClick={() => handleRemove(category._id)}
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {selectedCategories.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-slate-500" colSpan={4}>
                  Aucune catégorie ne sera affichée sur l&apos;accueil.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
