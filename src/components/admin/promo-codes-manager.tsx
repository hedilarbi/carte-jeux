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
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { fetchJson } from "@/lib/utils/fetch-json";
import { formatDateTime } from "@/lib/utils/format";
import { formatProductPrice } from "@/lib/utils/pricing";
import type { PromoCode, PromoCodeDiscountType } from "@/types/entities";

interface PromoCodesManagerProps {
  initialPromoCodes: PromoCode[];
}

interface PromoCodeFormState {
  code: string;
  type: PromoCodeDiscountType;
  value: string;
  expiresAt: string;
  usageLimit: string;
  usageLimitPerUser: string;
}

const defaultFormState: PromoCodeFormState = {
  code: "",
  type: "percentage",
  value: "",
  expiresAt: "",
  usageLimit: "",
  usageLimitPerUser: "",
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toLimitLabel(value?: number) {
  return value ? String(value) : "Illimité";
}

function formatPromoValue(type: PromoCodeDiscountType, value: number) {
  return type === "percentage" ? `${value}%` : `${formatProductPrice(value)} TND`;
}

function buildPayload(form: PromoCodeFormState) {
  return {
    code: form.code,
    type: form.type,
    value: Number(form.value),
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : "",
    usageLimit:
      form.usageLimit.trim() === "" ? null : Number(form.usageLimit),
    usageLimitPerUser:
      form.usageLimitPerUser.trim() === ""
        ? null
        : Number(form.usageLimitPerUser),
  };
}

function getPromoStatus(promoCode: PromoCode) {
  const isExpired = new Date(promoCode.expiresAt).getTime() <= Date.now();
  const isExhausted =
    promoCode.usageLimit !== undefined &&
    promoCode.usedCount >= promoCode.usageLimit;

  if (isExpired) {
    return {
      label: "Expiré",
      variant: "danger" as const,
    };
  }

  if (isExhausted) {
    return {
      label: "Épuisé",
      variant: "warning" as const,
    };
  }

  return {
    label: "Valide",
    variant: "success" as const,
  };
}

export function PromoCodesManager({
  initialPromoCodes,
}: PromoCodesManagerProps) {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoCodeFormState>(defaultFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPromoCodes = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return promoCodes;
    }

    return promoCodes.filter((promoCode) =>
      promoCode.code.toLowerCase().includes(query),
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

  function startEdit(promoCode: PromoCode) {
    setEditingId(promoCode._id);
    setForm({
      code: promoCode.code,
      type: promoCode.type,
      value: String(promoCode.value),
      expiresAt: toDateTimeLocal(promoCode.expiresAt),
      usageLimit:
        promoCode.usageLimit !== undefined ? String(promoCode.usageLimit) : "",
      usageLimitPerUser:
        promoCode.usageLimitPerUser !== undefined
          ? String(promoCode.usageLimitPerUser)
          : "",
    });
    setError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const savedPromoCode = await fetchJson<PromoCode>(
        editingId
          ? `/api/admin/promo-codes/${editingId}`
          : "/api/admin/promo-codes",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(buildPayload(form)),
        },
      );

      setPromoCodes((current) =>
        editingId
          ? current.map((promoCode) =>
              promoCode._id === editingId ? savedPromoCode : promoCode,
            )
          : [savedPromoCode, ...current],
      );
      resetForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'enregistrer le code promo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce code promo ?")) {
      return;
    }

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      });
      setPromoCodes((current) =>
        current.filter((promoCode) => promoCode._id !== id),
      );
      if (editingId === id) {
        resetForm();
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer le code promo.",
      );
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Codes promo</CardTitle>
            <CardDescription className="mt-2">
              Créez des réductions en pourcentage ou en montant fixe, avec
              expiration et limites d&apos;utilisation.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 lg:w-auto">
            <Input
              className="lg:w-72"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un code"
              value={search}
            />
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {error && !isFormOpen ? (
            <div className="border-b border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Réduction</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4">Limites</th>
                <th className="px-6 py-4">Utilisation</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromoCodes.map((promoCode) => {
                const status = getPromoStatus(promoCode);

                return (
                  <tr
                    className="border-b border-border text-slate-700"
                    key={promoCode._id}
                  >
                    <td className="px-6 py-4">
                      <Badge className="font-mono" variant="muted">
                        {promoCode.code}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {formatPromoValue(promoCode.type, promoCode.value)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {promoCode.type === "percentage"
                          ? "Pourcentage"
                          : "Montant fixe"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDateTime(promoCode.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>Global : {toLimitLabel(promoCode.usageLimit)}</div>
                      <div className="mt-1">
                        Par utilisateur :{" "}
                        {toLimitLabel(promoCode.usageLimitPerUser)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {promoCode.usedCount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="px-3"
                          onClick={() => startEdit(promoCode)}
                          variant="ghost"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          className="px-3 text-rose-600 hover:text-rose-700"
                          onClick={() => handleDelete(promoCode._id)}
                          variant="ghost"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPromoCodes.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    Aucun code promo ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Laissez une limite vide pour autoriser une utilisation illimitée."
        isOpen={isFormOpen}
        onClose={resetForm}
        title={editingId ? "Modifier le code promo" : "Créer un code promo"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Code
            </label>
            <Input
              maxLength={40}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="WELCOME10"
              required
              value={form.code}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type de réduction
              </label>
              <Select
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as PromoCodeDiscountType,
                  }))
                }
                value={form.type}
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Valeur
              </label>
              <Input
                min="0"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                placeholder={form.type === "percentage" ? "10" : "5.000"}
                required
                step="0.001"
                type="number"
                value={form.value}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date d&apos;expiration
            </label>
            <Input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  expiresAt: event.target.value,
                }))
              }
              required
              type="datetime-local"
              value={form.expiresAt}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Limite d&apos;utilisation
              </label>
              <Input
                min="1"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    usageLimit: event.target.value,
                  }))
                }
                placeholder="Illimité"
                type="number"
                value={form.usageLimit}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Limite par utilisateur
              </label>
              <Input
                min="1"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    usageLimitPerUser: event.target.value,
                  }))
                }
                placeholder="Illimité"
                type="number"
                value={form.usageLimitPerUser}
              />
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button className="flex-1" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour"
                  : "Créer le code"}
            </Button>
            <Button
              className="flex-1"
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
