import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPromosPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Scaffold"
        title="Promo campaigns"
        description="The promo campaign model and service layer are ready; the operational UI is staged for the next delivery batch."
      />
      <Card>
        <CardHeader>
          <CardTitle>Promo management placeholder</CardTitle>
          <CardDescription className="mt-2">
            Campaign scheduling, scoped product targeting, and lifecycle controls
            will be added once the backoffice MVP catalog flow is validated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-300">
          Planned scope: percentage campaigns, active windows, batch assignment
          to products, and admin visibility into overlapping promotions.
        </CardContent>
      </Card>
    </>
  );
}
