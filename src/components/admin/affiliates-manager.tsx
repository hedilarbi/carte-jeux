"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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
import { fetchJson } from "@/lib/utils/fetch-json";
import { formatDateTime } from "@/lib/utils/format";
import { formatProductPrice } from "@/lib/utils/pricing";
import type {
  AdminAffiliateListItem,
  AffiliatePromoCodeSummary,
} from "@/services/affiliate.service";
import type { PaginatedResult } from "@/types/common";
import type { PromoCode } from "@/types/entities";

interface AffiliatesManagerProps {
  initialAffiliates: AdminAffiliateListItem[];
}

interface AffiliateFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const defaultFormState: AffiliateFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

function formatPromoValue(promoCode: PromoCode | AffiliatePromoCodeSummary) {
  return promoCode.type === "percentage"
    ? `${promoCode.value}%`
    : `${formatProductPrice(promoCode.value)} TND`;
}

export function AffiliatesManager({
  initialAffiliates,
}: AffiliatesManagerProps) {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [form, setForm] = useState<AffiliateFormState>(defaultFormState);
  const [selectedPromoCodeIds, setSelectedPromoCodeIds] = useState<string[]>(
    [],
  );
  const [availablePromoCodes, setAvailablePromoCodes] = useState<PromoCode[]>(
    [],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingPromoCodes, setIsLoadingPromoCodes] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAffiliates = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return affiliates;
    }

    return affiliates.filter((affiliate) =>
      `${affiliate.firstName} ${affiliate.lastName} ${affiliate.email}`
        .toLowerCase()
        .includes(query),
    );
  })();

  function resetForm() {
    setForm(defaultFormState);
    setSelectedPromoCodeIds([]);
    setAvailablePromoCodes([]);
    setError(null);
    setIsFormOpen(false);
  }

  async function startCreate() {
    setForm(defaultFormState);
    setSelectedPromoCodeIds([]);
    setError(null);
    setIsFormOpen(true);
    setIsLoadingPromoCodes(true);

    try {
      const result = await fetchJson<PaginatedResult<PromoCode>>(
        "/api/admin/promo-codes?unassigned=true&limit=100",
      );
      setAvailablePromoCodes(result.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les codes promo disponibles.",
      );
    } finally {
      setIsLoadingPromoCodes(false);
    }
  }

  function togglePromoCode(id: string) {
    setSelectedPromoCodeIds((current) =>
      current.includes(id)
        ? current.filter((promoCodeId) => promoCodeId !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const createdAffiliate = await fetchJson<AdminAffiliateListItem>(
        "/api/admin/affiliates",
        {
          method: "POST",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            promoCodeIds: selectedPromoCodeIds,
          }),
        },
      );

      setAffiliates((current) => [createdAffiliate, ...current]);
      resetForm();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible de créer l'affilié.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Affiliés</CardTitle>
            <CardDescription className="mt-2">
              Créez des comptes affiliés et attribuez-leur des codes promo
              dédiés.
            </CardDescription>
          </div>
          <div className="flex w-full gap-3 lg:w-auto">
            <Input
              className="lg:w-72"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un affilié"
              value={search}
            />
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Créer un affilié
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
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Codes promo</th>
                <th className="px-6 py-4">Créé le</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((affiliate) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={affiliate._id}
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {affiliate.firstName} {affiliate.lastName}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {affiliate.email}
                  </td>
                  <td className="px-6 py-4">
                    {affiliate.promoCodes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {affiliate.promoCodes.map((promoCode) => (
                          <Badge
                            className="font-mono"
                            key={promoCode._id}
                            variant="muted"
                          >
                            {promoCode.code} · {formatPromoValue(promoCode)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Aucun code attribué
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {formatDateTime(affiliate.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={affiliate.isActive ? "success" : "muted"}>
                      {affiliate.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredAffiliates.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Aucun affilié ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Le mot de passe permettra à l'affilié de se connecter. Sélectionnez les codes promo à lui attribuer."
        isOpen={isFormOpen}
        onClose={resetForm}
        title="Créer un affilié"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                required
                value={form.firstName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nom
              </label>
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                required
                value={form.lastName}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <Input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
              type="email"
              value={form.email}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <Input
              minLength={8}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
              type="password"
              value={form.password}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Codes promo à attribuer
            </label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-border p-3">
              {isLoadingPromoCodes ? (
                <p className="px-2 py-4 text-center text-sm text-slate-500">
                  Chargement des codes promo...
                </p>
              ) : availablePromoCodes.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-slate-500">
                  Aucun code promo disponible (tous sont déjà attribués).
                </p>
              ) : (
                availablePromoCodes.map((promoCode) => (
                  <label
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-slate-50"
                    key={promoCode._id}
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={selectedPromoCodeIds.includes(promoCode._id)}
                        onChange={() => togglePromoCode(promoCode._id)}
                      />
                      <span className="font-mono font-medium">
                        {promoCode.code}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatPromoValue(promoCode)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button className="flex-1" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Création..." : "Créer l'affilié"}
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
