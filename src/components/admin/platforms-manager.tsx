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
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Platform } from "@/types/entities";

interface PlatformsManagerProps {
  initialPlatforms: Platform[];
}

interface PlatformFormState {
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
}

const defaultFormState: PlatformFormState = {
  name: "",
  slug: "",
  logo: "",
  isActive: true,
};

export function PlatformsManager({ initialPlatforms }: PlatformsManagerProps) {
  const router = useRouter();
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlatformFormState>(defaultFormState);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlatforms = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return platforms;
    }

    return platforms.filter((platform) =>
      [platform.name, platform.slug, platform.logo ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  })();

  function resetForm() {
    setEditingId(null);
    setForm(defaultFormState);
    setError(null);
  }

  function startEdit(platform: Platform) {
    setEditingId(platform._id);
    setForm({
      name: platform.name,
      slug: platform.slug,
      logo: platform.logo ?? "",
      isActive: platform.isActive,
    });
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const nextPlatform = await fetchJson<Platform>(
        editingId
          ? `/api/admin/platforms/${editingId}`
          : "/api/admin/platforms",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );

      setPlatforms((current) =>
        editingId
          ? current.map((platform) =>
              platform._id === editingId ? nextPlatform : platform,
            )
          : [nextPlatform, ...current],
      );

      resetForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'enregistrer la plateforme.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette plateforme ?")) {
      return;
    }

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/platforms/${id}`, {
        method: "DELETE",
      });
      setPlatforms((current) =>
        current.filter((platform) => platform._id !== id),
      );
      if (editingId === id) {
        resetForm();
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la plateforme.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Plateformes</CardTitle>
            <CardDescription className="mt-2">
              Gardez un ciblage plateforme cohérent sur l’ensemble des lignes produits.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher des plateformes"
              className="md:w-64"
            />
            <Button onClick={resetForm}>
              <Plus className="size-4" />
              Nouveau
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlatforms.map((platform) => (
                <tr
                  key={platform._id}
                  className="border-b border-white/6 text-slate-300"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{platform.name}</div>
                    {platform.logo ? (
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {platform.logo}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {platform.slug}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={platform.isActive ? "success" : "muted"}>
                      {platform.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => startEdit(platform)}
                        className="px-3"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(platform._id)}
                        className="px-3 text-rose-300 hover:text-rose-200"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlatforms.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Aucune plateforme ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Modifier la plateforme" : "Créer une plateforme"}
          </CardTitle>
          <CardDescription className="mt-2">
            Le logo doit pointer vers une URL CDN ou de stockage déjà disponible
            dans la stack frontend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nom
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="PlayStation"
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
                placeholder="playstation"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                URL du logo
              </label>
              <Input
                value={form.logo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, logo: event.target.value }))
                }
                placeholder="https://cdn.example.com/platforms/playstation.svg"
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
              La plateforme est active
            </label>
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
                    ? "Mettre à jour la plateforme"
                    : "Créer la plateforme"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
