import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlatformsManager } from "@/components/admin/platforms-manager";
import { platformService } from "@/services/platform.service";

export default async function AdminPlatformsPage() {
  const platforms = await platformService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Platforms"
        description="Manage storefront platform targets such as PlayStation, Xbox, Steam, Nintendo, or top-up channels."
      />
      <PlatformsManager initialPlatforms={platforms.items} />
    </>
  );
}
