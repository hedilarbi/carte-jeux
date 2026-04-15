import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlatformsManager } from "@/components/admin/platforms-manager";
import { platformService } from "@/services/platform.service";

export default async function AdminPlatformsPage() {
  const platforms = await platformService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Plateformes"
        description="Gérez les cibles de plateforme comme PlayStation, Xbox, Steam, Nintendo ou les canaux de recharge."
      />
      <PlatformsManager initialPlatforms={platforms.items} />
    </>
  );
}
