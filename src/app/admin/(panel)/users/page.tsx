import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersManager } from "@/components/admin/users-manager";
import { canExportUsersCsv, getAdminPageSession } from "@/lib/auth/admin";
import { userService } from "@/services/user.service";

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    userService.list({
      page: 1,
      limit: 100,
      roles: ["customer", "guest"],
    }),
    getAdminPageSession(),
  ]);

  return (
    <>
      <AdminPageHeader
        description="Consultez les clients inscrits et les invités créés automatiquement depuis les commandes passées sans connexion."
        eyebrow="Identités"
        title="Utilisateurs"
      />
      <UsersManager
        canExportCsv={await canExportUsersCsv(session)}
        initialTotalItems={users.totalItems}
        initialUsers={users.items}
      />
    </>
  );
}
