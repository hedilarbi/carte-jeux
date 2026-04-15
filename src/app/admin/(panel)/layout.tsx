import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPageAccess } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPageAccess();

  return <AdminShell session={session}>{children}</AdminShell>;
}
