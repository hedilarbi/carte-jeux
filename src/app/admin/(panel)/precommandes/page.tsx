import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";
import { gtaPreorderService } from "@/services/gta-preorder.service";

export default async function AdminPreordersPage() {
  const preorders = await gtaPreorderService.list({
    page: 1,
    limit: 100,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Précommandes"
        title="Précommandes GTA VI"
        description="Consultez les coordonnées laissées depuis la page de précommande GTA VI."
      />

      <Card>
        <CardHeader>
          <CardTitle>Demandes de précommande</CardTitle>
          <CardDescription className="mt-2">
            Les inscriptions envoyées depuis la page publique apparaissent ici,
            de la plus récente à la plus ancienne.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {preorders.items.map((preorder) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={preorder._id}
                >
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDateTime(preorder.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {preorder.firstName} {preorder.lastName}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[#4D3B94]">
                      GTA VI
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <a
                      className="transition hover:text-slate-950 hover:underline"
                      href={`mailto:${preorder.email}`}
                    >
                      {preorder.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <a
                      className="transition hover:text-slate-950 hover:underline"
                      href={`tel:${preorder.phone}`}
                    >
                      {preorder.phone}
                    </a>
                  </td>
                </tr>
              ))}
              {preorders.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Aucune précommande GTA VI n&apos;est disponible pour le
                    moment.
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
