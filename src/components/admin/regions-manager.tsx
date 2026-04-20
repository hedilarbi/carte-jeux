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
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Region } from "@/types/entities";

interface RegionsManagerProps {
  initialRegions: Region[];
}

interface RegionFormState {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const defaultFormState: RegionFormState = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

export function RegionsManager({ initialRegions }: RegionsManagerProps) {
  const router = useRouter();
  const [regions, setRegions] = useState(initialRegions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RegionFormState>(defaultFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRegions = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return regions;
    }

    return regions.filter((region) =>
      [region.name, region.code, region.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  })();

  function resetForm() {
    setEditingId(null);
    setForm(defaultFormState);
    setError(null);
    setIsFormOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(defaultFormState);
    setError(null);
    setIsFormOpen(true);
  }

  function startEdit(region: Region) {
    setEditingId(region._id);
    setForm({
      name: region.name,
      code: region.code,
      description: region.description ?? "",
      isActive: region.isActive,
    });
    setError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const nextRegion = await fetchJson<Region>(
        editingId ? `/api/admin/regions/${editingId}` : "/api/admin/regions",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );

      setRegions((current) =>
        editingId
          ? current.map((region) =>
              region._id === editingId ? nextRegion : region,
            )
          : [nextRegion, ...current],
      );

      resetForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'enregistrer la région.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette région ?")) {
      return;
    }

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/regions/${id}`, {
        method: "DELETE",
      });
      setRegions((current) => current.filter((region) => region._id !== id));
      if (editingId === id) {
        resetForm();
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la région.",
      );
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Régions</CardTitle>
            <CardDescription className="mt-2">
              Alignez la disponibilité produit et le positionnement prix avec les
              zones géographiques fournisseurs.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher des régions"
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
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Région</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegions.map((region) => (
                <tr key={region._id} className="border-b border-white/6 text-slate-300">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{region.name}</div>
                    {region.description ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {region.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="muted" className="font-mono">
                      {region.code}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={region.isActive ? "success" : "muted"}>
                      {region.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => startEdit(region)}
                        className="px-3"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(region._id)}
                        className="px-3 text-rose-300 hover:text-rose-200"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRegions.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Aucune région ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Les codes région peuvent suivre la logique marketplace, fournisseur ou ISO selon votre modèle opérationnel."
        isOpen={isFormOpen}
        onClose={resetForm}
        title={editingId ? "Modifier la région" : "Créer une région"}
      >
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
                placeholder="États-Unis"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Code
              </label>
              <Input
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="US"
                required
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
                placeholder="Notes optionnelles sur la région"
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
              La région est active
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
                    ? "Mettre à jour la région"
                    : "Créer la région"}
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
