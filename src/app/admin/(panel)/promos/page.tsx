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
        eyebrow="Préparation"
        title="Campagnes promo"
        description="Le modèle de campagne promo et la couche service sont prêts ; l'interface opérationnelle est prévue pour le prochain lot."
      />
      <Card>
        <CardHeader>
          <CardTitle>Placeholder de gestion des promotions</CardTitle>
          <CardDescription className="mt-2">
            La planification des campagnes, le ciblage produit et les contrôles
            de cycle de vie seront ajoutés une fois le flux catalogue du MVP
            validé.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-300">
          Périmètre prévu : campagnes en pourcentage, fenêtres d’activation,
          affectation en lot aux produits et visibilité admin sur les promotions
          qui se chevauchent.
        </CardContent>
      </Card>
    </>
  );
}
