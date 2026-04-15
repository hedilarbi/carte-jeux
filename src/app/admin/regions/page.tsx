import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RegionsManager } from "@/components/admin/regions-manager";
import { regionService } from "@/services/region.service";

export default async function AdminRegionsPage() {
  const regions = await regionService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Regions"
        description="Maintain region definitions used for supplier matching, pricing, and storefront availability."
      />
      <RegionsManager initialRegions={regions.items} />
    </>
  );
}
