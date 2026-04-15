import { Clock3, Package2, ShoppingCart, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardService } from "@/services/dashboard.service";

export default async function AdminDashboardPage() {
  const stats = await dashboardService.getStats();

  return (
    <>
      <AdminPageHeader
        eyebrow="Backoffice"
        title="Admin dashboard"
        description="Operational visibility for the manual digital product sourcing and email delivery workflow."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total products"
          value={stats.totalProducts}
          hint="Sellable SKUs"
          icon={Package2}
        />
        <KpiCard
          label="Total orders"
          value={stats.totalOrders}
          hint="Captured orders"
          icon={ShoppingCart}
        />
        <KpiCard
          label="Total users"
          value={stats.totalUsers}
          hint="Customer base"
          icon={Users}
        />
        <KpiCard
          label="Pending orders"
          value={stats.pendingOrders}
          hint="Needs admin action"
          icon={Clock3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow reminder</CardTitle>
            <CardDescription className="mt-2">
              This backoffice does not manage preloaded code inventory. Every
              fulfilled order is sourced after purchase and delivered manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              1. Customer places an order and payment is confirmed.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              2. Admin purchases the matching code from an external supplier.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              3. Admin records supplier details and emails the code to the
              customer.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation scope</CardTitle>
            <CardDescription className="mt-2">
              This first slice focuses on backoffice data operations with clean
              repositories, services, route handlers, and a typed admin UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-sky-400/12 bg-sky-400/8 p-4">
              Catalog CRUD is ready for categories, platforms, regions, and
              products.
            </div>
            <div className="rounded-2xl border border-emerald-500/12 bg-emerald-500/8 p-4">
              Order views are prepared for status updates, supplier metadata, and
              delivered code tracking.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              Users and promos remain scaffolded placeholders for the next phase.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
