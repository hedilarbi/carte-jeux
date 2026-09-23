import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADMIN_PAGE_SIZE, ORDER_STATUS_LABELS } from "@/constants/admin";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatOrderCharge } from "@/lib/utils/format";
import { orderService } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/entities";

const STATUS_FILTERS: Array<{ value: OrderStatus | "tous"; label: string }> = [
  { value: "tous", label: "Toutes" },
  ...(Object.entries(ORDER_STATUS_LABELS) as Array<[OrderStatus, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

function resolveStatusFilter(value?: string): OrderStatus | undefined {
  return value && value in ORDER_STATUS_LABELS
    ? (value as OrderStatus)
    : undefined;
}

function buildOrdersHref(status: OrderStatus | "tous", page: number) {
  const params = new URLSearchParams();

  if (status !== "tous") {
    params.set("status", status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: statusParam, page: pageParam } = await searchParams;
  const status = resolveStatusFilter(statusParam);
  const requestedPage = Math.max(1, Number(pageParam) || 1);

  const orders = await orderService.list({
    page: requestedPage,
    limit: ADMIN_PAGE_SIZE,
    status,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Opérations"
        title="Commandes"
        description="Suivez les commandes payées jusqu’à l’achat fournisseur, la préparation manuelle et la livraison au client."
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>File de commandes</CardTitle>
            <CardDescription className="mt-2">
              Gérez la progression opérationnelle de la confirmation de
              paiement jusqu’à l’envoi manuel du code par e-mail.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <Link
                key={item.value}
                href={buildOrdersHref(item.value, 1)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                  (status ?? "tous") === item.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-slate-600 hover:bg-slate-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Fournisseur</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => (
                <tr key={order._id} className="border-b border-border text-slate-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.orderNumber}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>{order.customerEmail}</div>
                    {order.customerPhone ? (
                      <div className="mt-1">{order.customerPhone}</div>
                    ) : null}
                    <div className="mt-1">{formatDateTime(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <OrderChargeCell order={order} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>{order.supplierPlatform || "Pas encore acheté"}</div>
                    <div className="mt-1">
                      {order.supplierPurchaseReference || "Aucune référence"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ouvrir la commande
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Aucune commande ne correspond au filtre actuel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Page {orders.page} sur {orders.totalPages} · {orders.totalItems}{" "}
            commande(s)
          </p>
          <div className="flex gap-2">
            {orders.hasPreviousPage ? (
              <Link
                href={buildOrdersHref(status ?? "tous", orders.page - 1)}
                className="rounded-xl border border-border px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ← Précédent
              </Link>
            ) : (
              <span className="rounded-xl border border-border px-4 py-2 font-semibold text-slate-300">
                ← Précédent
              </span>
            )}
            {orders.hasNextPage ? (
              <Link
                href={buildOrdersHref(status ?? "tous", orders.page + 1)}
                className="rounded-xl border border-border px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Suivant →
              </Link>
            ) : (
              <span className="rounded-xl border border-border px-4 py-2 font-semibold text-slate-300">
                Suivant →
              </span>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

function OrderChargeCell({ order }: { order: Order }) {
  const charge = formatOrderCharge(order);

  return (
    <>
      <div className="font-medium text-foreground">{charge.charged}</div>
      <div className="mt-1 text-slate-500">
        {order.paymentProvider ? (
          <>
            {order.paymentProvider}
            {charge.isConverted ? ` · payé en ${charge.chargedCurrency}` : null}
          </>
        ) : (
          "Fournisseur de paiement en attente"
        )}
      </div>
    </>
  );
}
