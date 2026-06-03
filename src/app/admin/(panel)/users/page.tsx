import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";
import { userService, type AdminUserListItem } from "@/services/user.service";

function roleLabel(role: AdminUserListItem["role"]) {
  return role === "admin" ? "Admin" : "Client";
}

function providerLabel(provider: AdminUserListItem["authProviders"][number]) {
  switch (provider) {
    case "facebook":
      return "Facebook";
    case "google":
      return "Google";
    default:
      return "Email";
  }
}

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}

export default async function AdminUsersPage() {
  const users = await userService.list({ page: 1, limit: 100 });
  const customerCount = users.items.filter((user) => user.role === "customer").length;
  const adminCount = users.items.filter((user) => user.role === "admin").length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Identités"
        title="Utilisateurs"
        description="Consultez les comptes enregistrés, leur statut, leur rôle et les méthodes de connexion utilisées."
      />
      <Card>
        <CardHeader>
          <CardTitle>Comptes enregistrés</CardTitle>
          <CardDescription className="mt-2">
            {users.totalItems} utilisateur{users.totalItems > 1 ? "s" : ""} au
            total, dont {customerCount} client{customerCount > 1 ? "s" : ""} et{" "}
            {adminCount} admin{adminCount > 1 ? "s" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Connexion</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {users.items.map((user) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={user._id}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.authProviders.map((provider) => (
                        <span
                          className="inline-flex rounded-full bg-[#E7DAFF] px-2.5 py-1 text-xs font-semibold text-[#8258CB]"
                          key={`${user._id}-${provider}`}
                        >
                          {providerLabel(provider)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserStatusBadge isActive={user.isActive} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDateTime(user.createdAt)}
                  </td>
                </tr>
              ))}
              {users.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Aucun utilisateur enregistré pour le moment.
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
