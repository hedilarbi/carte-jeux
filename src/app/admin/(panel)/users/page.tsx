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
        eyebrow="Préparation"
        title="Utilisateurs"
        description="La gestion des identités client et admin arrivera dans la prochaine phase, une fois l'auth au-delà du scaffold actuel."
      />
      <Card>
        <CardHeader>
          <CardTitle>Placeholder de gestion des utilisateurs</CardTitle>
          <CardDescription className="mt-2">
            Le modèle utilisateur, le repository et le service compatible seed
            sont déjà en place. Cette page est volontairement réservée à
            l’itération dédiée à l’authentification et aux permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-300">
          Périmètre prévu : liste des utilisateurs, activation/désactivation,
          changement de rôle, métadonnées d’audit et intégration fournisseur
          d’auth.
        </CardContent>
      </Card>
    </>
  );
}
