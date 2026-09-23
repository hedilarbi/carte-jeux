import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AFFILIATE_COMMISSION_RATE } from "@/constants/affiliate";
import { requireAffiliatePageAccess } from "@/lib/auth/affiliate";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";
import { orderService } from "@/services/order.service";
import { promoCodeService } from "@/services/promo-code.service";
import type { PaymentStatus } from "@/types/entities";

function formatExactAmount(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "0";
}

type AffiliateOrderFilter = "tous" | "en_attente" | "valide" | "annule";

const FILTERS: Array<{ value: AffiliateOrderFilter; label: string }> = [
  { value: "tous", label: "Toutes" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validées" },
  { value: "annule", label: "Annulées" },
];

const ORDER_STATE_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Validée",
  failed: "Annulée",
  refunded: "Annulée",
};

const ORDER_STATE_VARIANTS: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "danger",
};

function resolveFilter(value?: string): AffiliateOrderFilter {
  return value === "en_attente" || value === "valide" || value === "annule"
    ? value
    : "tous";
}

function resolvePaymentStatuses(
  filter: AffiliateOrderFilter,
): PaymentStatus[] | undefined {
  switch (filter) {
    case "en_attente":
      return ["pending"];
    case "valide":
      return ["paid"];
    case "annule":
      return ["failed", "refunded"];
    default:
      return undefined;
  }
}

export default async function AffiliatePromoCodeOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ etat?: string }>;
}) {
  const session = await requireAffiliatePageAccess();
  const { id } = await params;
  const { etat } = await searchParams;

  const promoCode = await promoCodeService.getById(id).catch(() => null);

  if (!promoCode || promoCode.affiliateUserId !== session.userId) {
    notFound();
  }

  const filter = resolveFilter(etat);
  const [orders, paidTotal] = await Promise.all([
    orderService.list({
      promoCodeId: id,
      paymentStatuses: resolvePaymentStatuses(filter),
      page: 1,
      limit: 100,
    }),
    orderService.getPaidTotalByPromoCode(id),
  ]);
  const commission = paidTotal * AFFILIATE_COMMISSION_RATE;

  return (
    <>
      <Link
        className="text-sm font-semibold text-primary hover:underline"
        href="/affiliation"
      >
        ← Retour à mes codes promo
      </Link>

      <AdminPageHeader
        eyebrow="Espace affilié"
        title={`Code ${promoCode.code}`}
        description="Retrouvez les commandes passées avec ce code et votre commission."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total des commandes validées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">
              {formatExactAmount(paidTotal)} TND
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Votre commission ({AFFILIATE_COMMISSION_RATE * 100}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">
              {formatExactAmount(commission)} TND
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Commandes</CardTitle>
            <CardDescription className="mt-2">
              {orders.items.length} commande(s) affichée(s).
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Link
                key={item.value}
                href={
                  item.value === "tous"
                    ? `/affiliation/codes-promo/${id}`
                    : `/affiliation/codes-promo/${id}?etat=${item.value}`
                }
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                  filter === item.value
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
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={order._id}
                >
                  <td className="px-6 py-4">
                    <Badge className="font-mono" variant="muted">
                      {order.appliedPromoCode?.code ?? promoCode.code}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={ORDER_STATE_VARIANTS[order.paymentStatus]}>
                      {ORDER_STATE_LABELS[order.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatExactAmount(order.total)} {order.currency}
                  </td>
                </tr>
              ))}
              {orders.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Aucune commande pour ce filtre.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
