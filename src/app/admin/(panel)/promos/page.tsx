import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PromoCodesManager } from "@/components/admin/promo-codes-manager";
import { promoCodeService } from "@/services/promo-code.service";

export default async function AdminPromosPage() {
  const promoCodes = await promoCodeService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Codes promo"
        description="Gérez les codes de réduction utilisables dans le panier client, avec expiration et limites d'utilisation."
      />
      <PromoCodesManager initialPromoCodes={promoCodes.items} />
    </>
  );
}
