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
        title="Tableau de bord admin"
        description="Vision opérationnelle du workflow d'achat manuel et de livraison par e-mail des produits digitaux."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total produits"
          value={stats.totalProducts}
          hint="SKU vendables"
          icon={Package2}
        />
        <KpiCard
          label="Total commandes"
          value={stats.totalOrders}
          hint="Commandes enregistrées"
          icon={ShoppingCart}
        />
        <KpiCard
          label="Total utilisateurs"
          value={stats.totalUsers}
          hint="Base clients"
          icon={Users}
        />
        <KpiCard
          label="Commandes en attente"
          value={stats.pendingOrders}
          hint="Action admin requise"
          icon={Clock3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rappel du workflow</CardTitle>
            <CardDescription className="mt-2">
              Ce backoffice ne gère pas de stock de codes préchargés. Chaque
              commande livrée est sourcée après achat puis envoyée manuellement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              1. Le client passe commande et le paiement est confirmé.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              2. L’admin achète le code correspondant chez un fournisseur externe.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              3. L’admin enregistre les détails fournisseur et envoie le code par e-mail au client.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Périmètre implémenté</CardTitle>
            <CardDescription className="mt-2">
              Cette première version se concentre sur les opérations backoffice
              avec des repositories propres, des services, des route handlers et
              une interface admin typée.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-sky-400/12 bg-sky-400/8 p-4">
              Le CRUD catalogue est prêt pour les catégories, plateformes,
              régions et produits.
            </div>
            <div className="rounded-2xl border border-emerald-500/12 bg-emerald-500/8 p-4">
              Les vues commandes sont prêtes pour les mises à jour de statut,
              les métadonnées fournisseur et le suivi des codes livrés.
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
              Les utilisateurs et promotions restent des placeholders pour la
              prochaine phase.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
