"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetch-json";
import { formatDateTime } from "@/lib/utils/format";
import type { AdminUserListItem } from "@/services/user.service";

interface UsersManagerProps {
  initialTotalItems: number;
  initialUsers: AdminUserListItem[];
}

function roleLabel(role: AdminUserListItem["role"]) {
  switch (role) {
    case "admin":
      return "Admin";
    case "guest":
      return "Invité";
    default:
      return "Client";
  }
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

export function UsersManager({
  initialTotalItems,
  initialUsers,
}: UsersManagerProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [userToDelete, setUserToDelete] =
    useState<AdminUserListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const customerCount = users.filter((user) => user.role === "customer").length;
  const guestCount = users.filter((user) => user.role === "guest").length;

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setUserToDelete(null);
    setError(null);
  }

  async function confirmDelete() {
    if (!userToDelete || isDeleting) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await fetchJson<{ success: boolean }>(
        `/api/admin/users/${userToDelete._id}`,
        {
          method: "DELETE",
        },
      );

      setUsers((current) =>
        current.filter((user) => user._id !== userToDelete._id),
      );
      setTotalItems((current) => Math.max(0, current - 1));
      setUserToDelete(null);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer cet utilisateur.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comptes enregistrés</CardTitle>
          <CardDescription className="mt-2">
            {totalItems} utilisateur{totalItems > 1 ? "s" : ""}, dont{" "}
            {customerCount} client{customerCount > 1 ? "s" : ""} et{" "}
            {guestCount} invité{guestCount > 1 ? "s" : ""}.
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                    {user.phone ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {user.phone}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.role === "guest" ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Commande invitée
                        </span>
                      ) : null}
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
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        aria-label={`Supprimer ${user.email}`}
                        className="px-3 text-rose-600 hover:text-rose-700"
                        onClick={() => setUserToDelete(user)}
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={6}
                  >
                    Aucun utilisateur enregistré pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        description="Cette action supprimera définitivement cet utilisateur de la base de données."
        isOpen={Boolean(userToDelete)}
        onClose={closeDeleteModal}
        title="Supprimer l'utilisateur ?"
      >
        {userToDelete ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              Vous êtes sur le point de supprimer{" "}
              <span className="font-semibold">
                {userToDelete.firstName} {userToDelete.lastName}
              </span>{" "}
              ({userToDelete.email}). Cette action est définitive.
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                disabled={isDeleting}
                onClick={closeDeleteModal}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                disabled={isDeleting}
                onClick={confirmDelete}
                variant="danger"
              >
                {isDeleting ? "Suppression..." : "Continuer"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
