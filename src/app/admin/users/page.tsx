import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Scaffold"
        title="Users"
        description="Customer and admin identity management will land in the next phase once auth moves beyond the current scaffold."
      />
      <Card>
        <CardHeader>
          <CardTitle>User management placeholder</CardTitle>
          <CardDescription className="mt-2">
            The user model, repository, and seed-safe service are already in
            place. This page is intentionally reserved for the dedicated auth
            and permissions iteration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-300">
          Planned scope: user listing, activation toggles, role changes, audit
          metadata, and auth-provider integration.
        </CardContent>
      </Card>
    </>
  );
}
