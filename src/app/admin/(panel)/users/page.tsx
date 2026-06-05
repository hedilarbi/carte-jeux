import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersManager } from "@/components/admin/users-manager";
import { userService } from "@/services/user.service";

export default async function AdminUsersPage() {
  const users = await userService.list({
    page: 1,
    limit: 100,
    roles: ["customer", "guest"],
  });

  return (
    <>
      <AdminPageHeader
        description="Consultez les clients inscrits et les invités créés automatiquement depuis les commandes passées sans connexion."
        eyebrow="Identités"
        title="Utilisateurs"
      />
      <UsersManager
        initialTotalItems={users.totalItems}
        initialUsers={users.items}
      />
    </>
  );
}
