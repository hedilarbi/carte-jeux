"use client";

import { useState } from "react";
import { Mail, PackageCheck, ReceiptText, Truck } from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
} from "@/constants/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { Order } from "@/types/entities";

interface OrderDetailManagerProps {
  initialOrder: Order;
}

interface StatusFormState {
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentProvider: string;
  paymentReference: string;
}

interface SupplierFormState {
  supplierPlatform: string;
  supplierPurchaseReference: string;
  supplierCost: string;
  internalNote: string;
}

interface DeliveryFormState {
  deliveredCode: string;
  deliveryNote: string;
}

export function OrderDetailManager({
  initialOrder,
}: OrderDetailManagerProps) {
  const [order, setOrder] = useState(initialOrder);
  const [statusForm, setStatusForm] = useState<StatusFormState>({
    status: initialOrder.status,
    paymentStatus: initialOrder.paymentStatus,
    paymentProvider: initialOrder.paymentProvider ?? "",
    paymentReference: initialOrder.paymentReference ?? "",
  });
  const [supplierForm, setSupplierForm] = useState<SupplierFormState>({
    supplierPlatform: initialOrder.supplierPlatform ?? "",
    supplierPurchaseReference: initialOrder.supplierPurchaseReference ?? "",
    supplierCost:
      initialOrder.supplierCost !== undefined
        ? String(initialOrder.supplierCost)
        : "",
    internalNote: initialOrder.internalNote ?? "",
  });
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>({
    deliveredCode: initialOrder.deliveredCode ?? "",
    deliveryNote: initialOrder.deliveryNote ?? "",
  });
  const [statusError, setStatusError] = useState<string | null>(null);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<
    "status" | "supplier" | "delivery" | null
  >(null);

  function syncForms(nextOrder: Order) {
    setStatusForm({
      status: nextOrder.status,
      paymentStatus: nextOrder.paymentStatus,
      paymentProvider: nextOrder.paymentProvider ?? "",
      paymentReference: nextOrder.paymentReference ?? "",
    });
    setSupplierForm({
      supplierPlatform: nextOrder.supplierPlatform ?? "",
      supplierPurchaseReference: nextOrder.supplierPurchaseReference ?? "",
      supplierCost:
        nextOrder.supplierCost !== undefined ? String(nextOrder.supplierCost) : "",
      internalNote: nextOrder.internalNote ?? "",
    });
    setDeliveryForm({
      deliveredCode: nextOrder.deliveredCode ?? "",
      deliveryNote: nextOrder.deliveryNote ?? "",
    });
  }

  async function applyPatch(
    payload: Record<string, unknown>,
    panel: "status" | "supplier" | "delivery",
  ) {
    const nextOrder = await fetchJson<Order>(`/api/admin/orders/${order._id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    setOrder(nextOrder);
    syncForms(nextOrder);
    setActivePanel(null);
    if (panel === "status") {
      setStatusError(null);
    }
    if (panel === "supplier") {
      setSupplierError(null);
    }
    if (panel === "delivery") {
      setDeliveryError(null);
    }
  }

  async function handleStatusSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusError(null);
    setActivePanel("status");

    try {
      await applyPatch(statusForm, "status");
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour le statut de la commande.",
      );
      setActivePanel(null);
    }
  }

  async function handleSupplierSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSupplierError(null);
    setActivePanel("supplier");

    try {
      await applyPatch(
        {
          ...supplierForm,
          supplierCost:
            supplierForm.supplierCost.trim() === ""
              ? undefined
              : Number(supplierForm.supplierCost),
        },
        "supplier",
      );
    } catch (error) {
      setSupplierError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour les informations fournisseur.",
      );
      setActivePanel(null);
    }
  }

  async function handleDeliverySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeliveryError(null);
    setActivePanel("delivery");

    try {
      await applyPatch(deliveryForm, "delivery");
    } catch (error) {
      setDeliveryError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour les informations de livraison.",
      );
      setActivePanel(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b border-white/8 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <CardTitle className="mt-4">
              Commande {order.orderNumber}
            </CardTitle>
            <CardDescription className="mt-2">
              Client {order.customerEmail} · Créée le {formatDateTime(order.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Total
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(order.total, order.currency)}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Sous-total {formatCurrency(order.subtotal, order.currency)} ·
                Remise {formatCurrency(order.totalDiscount, order.currency)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Livraison
              </div>
              <div className="mt-2 text-sm text-slate-200">
                Méthode : {order.deliveryMethod}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Livrée le {formatDateTime(order.deliveredAt)}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Payée le {formatDateTime(order.paidAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles de la commande</CardTitle>
            <CardDescription className="mt-2">
              Instantané immuable du checkout utilisé pour l’achat fournisseur
              et la livraison client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.sku}-${index}`}
                className="rounded-2xl border border-white/8 bg-slate-950/40 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{item.productTitle}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.sku} · Qté {item.quantity}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-white">
                      {formatCurrency(item.lineTotal, item.currency)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Unité {formatCurrency(item.finalUnitPrice, item.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-sky-400/12 bg-sky-400/8 p-3 text-sky-300">
                <PackageCheck className="size-5" />
              </div>
              <div>
                <CardTitle>Statut et paiement</CardTitle>
                <CardDescription className="mt-2">
                  Mettez à jour l’étape opérationnelle et les métadonnées de suivi du paiement.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleStatusSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Statut de la commande
                  </label>
                  <Select
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        status: event.target.value as Order["status"],
                      }))
                    }
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Statut du paiement
                  </label>
                  <Select
                    value={statusForm.paymentStatus}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        paymentStatus: event.target.value as Order["paymentStatus"],
                      }))
                    }
                  >
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {PAYMENT_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Fournisseur de paiement
                  </label>
                  <Input
                    value={statusForm.paymentProvider}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        paymentProvider: event.target.value,
                      }))
                    }
                    placeholder="Stripe"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Référence de paiement
                  </label>
                  <Input
                    value={statusForm.paymentReference}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        paymentReference: event.target.value,
                      }))
                    }
                    placeholder="pi_123..."
                  />
                </div>
              </div>
              {statusError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {statusError}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={activePanel === "status"}
                className="w-full"
              >
                {activePanel === "status" ? "Enregistrement..." : "Enregistrer le statut"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-500/12 bg-emerald-500/8 p-3 text-emerald-300">
                <Truck className="size-5" />
              </div>
              <div>
                <CardTitle>Achat fournisseur</CardTitle>
                <CardDescription className="mt-2">
                  Enregistrez les métadonnées d’achat fournisseur externe et les notes internes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSupplierSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Plateforme fournisseur
                  </label>
                  <Input
                    value={supplierForm.supplierPlatform}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        supplierPlatform: event.target.value,
                      }))
                    }
                    placeholder="Portail fournisseur de cartes"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Référence fournisseur
                  </label>
                  <Input
                    value={supplierForm.supplierPurchaseReference}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        supplierPurchaseReference: event.target.value,
                      }))
                    }
                    placeholder="SUP-2026-00045"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Coût fournisseur
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={supplierForm.supplierCost}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        supplierCost: event.target.value,
                      }))
                    }
                    placeholder="42.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Note interne
                  </label>
                  <Textarea
                    value={supplierForm.internalNote}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        internalNote: event.target.value,
                      }))
                    }
                    placeholder="Le stock fournisseur fluctue chaque soir."
                  />
                </div>
              </div>
              {supplierError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {supplierError}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={activePanel === "supplier"}
                className="w-full"
              >
                {activePanel === "supplier" ? "Enregistrement..." : "Enregistrer les infos fournisseur"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-500/12 bg-amber-500/8 p-3 text-amber-300">
                <Mail className="size-5" />
              </div>
              <div>
                <CardTitle>Détails de livraison</CardTitle>
                <CardDescription className="mt-2">
                  Stockez le code envoyé au client et la note de livraison
                  utilisée pour l’envoi manuel par e-mail.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleDeliverySubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Code livré
                </label>
                <Textarea
                  value={deliveryForm.deliveredCode}
                  onChange={(event) =>
                    setDeliveryForm((current) => ({
                      ...current,
                      deliveredCode: event.target.value,
                    }))
                  }
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Note de livraison
                </label>
                <Textarea
                  value={deliveryForm.deliveryNote}
                  onChange={(event) =>
                    setDeliveryForm((current) => ({
                      ...current,
                      deliveryNote: event.target.value,
                    }))
                  }
                    placeholder="Envoyé manuellement depuis support@domain.com"
                  />
              </div>
              {deliveryError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {deliveryError}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={activePanel === "delivery"}
                className="w-full"
              >
                {activePanel === "delivery" ? "Enregistrement..." : "Enregistrer les données de livraison"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-slate-300">
                <ReceiptText className="size-5" />
              </div>
              <div>
                <CardTitle>Références</CardTitle>
                <CardDescription className="mt-2">
                  Référence opérationnelle rapide pour l’équipe de fulfilment.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              Référence de paiement : {order.paymentReference || "—"}
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              Référence fournisseur : {order.supplierPurchaseReference || "—"}
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              Code livré enregistré : {order.deliveredCode ? "Oui" : "Non"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
