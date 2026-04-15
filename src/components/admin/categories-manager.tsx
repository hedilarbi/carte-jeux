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
  isActive: boolean;
}

const defaultFormState: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultFormState);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug, category.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  })();

  function startCreate() {
    setEditingId(null);
    setForm(defaultFormState);
    setError(null);
  }

  function startEdit(category: Category) {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isActive: category.isActive,
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
        slug: form.slug.trim(),
      };

      const nextCategory = await fetchJson<Category>(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setCategories((current) =>
        editingId
          ? current.map((category) =>
              category._id === editingId ? nextCategory : category,
            )
          : [nextCategory, ...current],
      );

      startCreate();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    setError(null);

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      setCategories((current) =>
        current.filter((category) => category._id !== id),
      );

      if (editingId === id) {
        startCreate();
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete category.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Category catalog</CardTitle>
            <CardDescription className="mt-2">
              Organize products by vertical, brand family, or business segment.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
              className="md:w-64"
            />
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category._id}
                  className="border-b border-white/6 text-slate-300"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{category.name}</div>
                    {category.description ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {category.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={category.isActive ? "success" : "muted"}>
                      {category.isActive ? "Active" : "Hidden"}
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
                        className="px-3 text-rose-300 hover:text-rose-200"
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
                    colSpan={4}
                  >
                    No categories match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit category" : "Create category"}</CardTitle>
          <CardDescription className="mt-2">
            Slug can be left empty to auto-generate it from the category name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Name
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Game gift cards"
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
                placeholder="game-gift-cards"
              />
            </div>
            <div>
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
                placeholder="Optional category description"
              />
            </div>
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
              Category is active
            </label>
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
                    ? "Update category"
                    : "Create category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={startCreate}
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
