import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AffiliatesManager } from "@/components/admin/affiliates-manager";
import { affiliateService } from "@/services/affiliate.service";

export default async function AdminAffiliatesPage() {
  const affiliates = await affiliateService.list();

  return (
    <>
      <AdminPageHeader
        eyebrow="Partenariats"
        title="Affiliation"
        description="Gérez les comptes affiliés et les codes promo qui leur sont attribués."
      />
      <AffiliatesManager initialAffiliates={affiliates.items} />
    </>
  );
}
