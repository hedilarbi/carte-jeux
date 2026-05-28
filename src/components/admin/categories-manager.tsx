"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

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
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Category } from "@/types/entities";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  isPlateforme: boolean;
  isActive: boolean;
}

const defaultFormState: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  isPlateforme: false,
  isActive: true,
};

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

function sortCategories(categories: Category[]) {
  return [...categories].sort((firstCategory, secondCategory) => {
    const firstOrder = firstCategory.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = secondCategory.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return firstCategory.createdAt.localeCompare(secondCategory.createdAt);
  });
}

function applySequentialSortOrders(categories: Category[]) {
  return categories.map((category, index) => ({
    ...category,
    sortOrder: index + 1,
  }));
}

function moveCategory(categories: Category[], draggedId: string, targetId: string) {
  const draggedIndex = categories.findIndex(
    (category) => category._id === draggedId,
  );
  const targetIndex = categories.findIndex((category) => category._id === targetId);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return categories;
  }

  const nextCategories = [...categories];
  const [draggedCategory] = nextCategories.splice(draggedIndex, 1);

  if (!draggedCategory) {
    return categories;
  }

  nextCategories.splice(targetIndex, 0, draggedCategory);

  return applySequentialSortOrders(nextCategories);
}

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(() =>
    sortCategories(initialCategories),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const isFiltering = search.trim().length > 0;

  const filteredCategories = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [
        category.name,
        category.slug,
        category.description ?? "",
        category.isPlateforme ? "plateforme" : "categorie",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  })();

  function startCreate() {
    setEditingId(null);
    setForm(defaultFormState);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setIsFormOpen(true);
  }

  function startEdit(category: Category) {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isPlateforme: Boolean(category.isPlateforme),
      isActive: category.isActive,
    });
    setImageFile(null);
    setImagePreview(category.image ?? null);
    setError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(defaultFormState);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setIsFormOpen(false);
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
      setError("Impossible de lire l'image sélectionnée.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = new FormData(event.currentTarget);
      payload.set("name", form.name);
      payload.set("slug", form.slug.trim());
      payload.set("description", form.description);
      payload.set("isPlateforme", String(form.isPlateforme));
      payload.set("isActive", String(form.isActive));

      const selectedImage = payload.get("image");
      const hasSelectedImage =
        selectedImage instanceof File && selectedImage.size > 0;

      if (imageFile) {
        payload.set("image", imageFile);
      }

      payload.set(
        "hasImageSelection",
        String(hasSelectedImage || Boolean(imageFile)),
      );

      const nextCategory = await fetchJson<Category>(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PUT" : "POST",
          body: payload,
        },
      );

      setCategories((current) =>
        editingId
          ? sortCategories(
              current.map((category) =>
                category._id === editingId ? nextCategory : category,
              ),
            )
          : sortCategories([...current, nextCategory]),
      );

      closeForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'enregistrer la catégorie.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette catégorie ?")) {
      return;
    }

    setError(null);

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      setCategories((current) =>
        applySequentialSortOrders(
          current.filter((category) => category._id !== id),
        ),
      );

      if (editingId === id) {
        closeForm();
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la catégorie.",
      );
    }
  }

  async function persistCategoryOrder(
    nextCategories: Category[],
    previousCategories: Category[],
  ) {
    setIsReordering(true);
    setError(null);

    try {
      const orderedCategories = await fetchJson<Category[]>(
        "/api/admin/categories/reorder",
        {
          method: "PATCH",
          body: JSON.stringify({
            categoryIds: nextCategories.map((category) => category._id),
          }),
        },
      );

      setCategories(sortCategories(orderedCategories));
      router.refresh();
    } catch (reorderError) {
      setCategories(previousCategories);
      setError(
        reorderError instanceof Error
          ? reorderError.message
          : "Impossible de mettre à jour l'ordre des catégories.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  function handleDragStart(
    event: React.DragEvent<HTMLTableRowElement>,
    categoryId: string,
  ) {
    if (isFiltering || isReordering) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryId);
    setDraggedCategoryId(categoryId);
  }

  function handleDragOver(event: React.DragEvent<HTMLTableRowElement>) {
    if (!draggedCategoryId || isFiltering || isReordering) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(
    event: React.DragEvent<HTMLTableRowElement>,
    targetCategoryId: string,
  ) {
    event.preventDefault();

    const draggedId =
      draggedCategoryId || event.dataTransfer.getData("text/plain") || null;

    if (!draggedId || draggedId === targetCategoryId || isFiltering || isReordering) {
      setDraggedCategoryId(null);
      return;
    }

    const previousCategories = categories;
    const nextCategories = moveCategory(categories, draggedId, targetCategoryId);

    setDraggedCategoryId(null);

    if (nextCategories === categories) {
      return;
    }

    setCategories(nextCategories);
    await persistCategoryOrder(nextCategories, previousCategories);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Catalogue des catégories</CardTitle>
            <CardDescription className="mt-2">
              Organisez les produits par univers, famille de marque ou segment métier.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher des catégories"
              className="md:w-64"
            />
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
                <th className="px-6 py-4">Ordre</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category, index) => (
                <tr
                  key={category._id}
                  draggable={!isFiltering && !isReordering}
                  onDragEnd={() => setDraggedCategoryId(null)}
                  onDragOver={handleDragOver}
                  onDragStart={(event) => handleDragStart(event, category._id)}
                  onDrop={(event) => handleDrop(event, category._id)}
                  className={`border-b border-border text-slate-700 transition ${
                    draggedCategoryId === category._id ? "opacity-45" : ""
                  } ${!isFiltering && !isReordering ? "cursor-grab" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <GripVertical
                        className={`size-4 ${
                          isFiltering || isReordering ? "opacity-30" : ""
                        }`}
                      />
                      <span className="font-mono text-xs">
                        #{category.sortOrder ?? index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        alt={`Image ${category.name}`}
                        className="size-11 shrink-0 rounded-xl"
                        emptyLabel="—"
                        src={category.image}
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {category.name}
                        </div>
                        {category.description ? (
                          <div className="mt-1 text-xs text-slate-500">
                            {category.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={category.isPlateforme ? "default" : "muted"}>
                      {category.isPlateforme ? "Plateforme" : "Catégorie"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={category.isActive ? "success" : "muted"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => startEdit(category)}
                        className="px-3"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(category._id)}
                        className="px-3 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={6}
                  >
                    Aucune catégorie ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Le slug peut être laissé vide pour être généré automatiquement à partir du nom."
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Modifier la catégorie" : "Créer une catégorie"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image
              </label>
              <ImagePreview
                alt="Aperçu de la catégorie"
                className="mb-3 aspect-[16/9]"
                emptyLabel="Aucune image sélectionnée"
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
                Optionnel. Si aucune nouvelle image n&apos;est choisie en
                édition, l&apos;image existante est conservée.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nom
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Cartes cadeaux gaming"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="game-gift-cards"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
                placeholder="Description optionnelle de la catégorie"
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Checkbox
                checked={form.isPlateforme}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isPlateforme: event.target.checked,
                  }))
                }
              />
              Cette catégorie est une plateforme
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
              La catégorie est active
            </label>
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
                    ? "Mettre à jour la catégorie"
                    : "Créer la catégorie"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
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
