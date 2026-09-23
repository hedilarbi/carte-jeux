import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAffiliatePageAccess } from "@/lib/auth/affiliate";
import { formatProductPrice } from "@/lib/utils/pricing";
import { promoCodeService } from "@/services/promo-code.service";
import type { PromoCodeDiscountType } from "@/types/entities";

function formatPromoValue(type: PromoCodeDiscountType, value: number) {
  return type === "percentage"
    ? `${value}%`
    : `${formatProductPrice(value)} TND`;
}

export default async function AffiliateHomePage() {
  const session = await requireAffiliatePageAccess();
  const promoCodes = await promoCodeService.list({
    affiliateUserId: session.userId,
    page: 1,
    limit: 100,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Espace affilié"
        title="Mes codes promo"
        description="Cliquez sur un code pour voir le détail des commandes passées avec celui-ci et votre commission."
      />
      <Card>
        <CardHeader>
          <CardTitle>Codes promo</CardTitle>
          <CardDescription>
            {promoCodes.items.length} code(s) promo attribué(s).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Réduction</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.items.map((promoCode) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={promoCode._id}
                >
                  <td className="px-6 py-4">
                    <Badge className="font-mono" variant="muted">
                      {promoCode.code}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatPromoValue(promoCode.type, promoCode.value)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      className="text-sm font-semibold text-primary hover:underline"
                      href={`/affiliation/codes-promo/${promoCode._id}`}
                    >
                      Voir les commandes →
                    </Link>
                  </td>
                </tr>
              ))}
              {promoCodes.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={3}
                  >
                    Aucun code promo ne vous a encore été attribué.
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
