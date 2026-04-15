import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RegionsManager } from "@/components/admin/regions-manager";
import { regionService } from "@/services/region.service";

export default async function AdminRegionsPage() {
  const regions = await regionService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Régions"
        description="Maintenez les définitions de région utilisées pour l'association fournisseur, le pricing et la disponibilité."
      />
      <RegionsManager initialRegions={regions.items} />
    </>
  );
}
