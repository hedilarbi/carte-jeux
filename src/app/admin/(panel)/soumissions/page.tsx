import Link from "next/link";
import { Eye } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";
import { contactSubmissionService } from "@/services/contact-submission.service";
import type { ContactSubmissionStatus } from "@/types/entities";

const statusLabels: Record<ContactSubmissionStatus, string> = {
  new: "Nouvelle",
  replied: "Répondue",
};

const statusClasses: Record<ContactSubmissionStatus, string> = {
  new: "border-sky-200 bg-sky-50 text-sky-700",
  replied: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default async function AdminContactSubmissionsPage() {
  const submissions = await contactSubmissionService.list({
    page: 1,
    limit: 100,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Support"
        title="Soumissions"
        description="Consultez les demandes envoyées depuis le formulaire de l'accueil et répondez directement par e-mail aux clients."
      />

      <Card>
        <CardHeader>
          <CardTitle>Demandes produit</CardTitle>
          <CardDescription className="mt-2">
            Les nouvelles demandes arrivent ici après l&apos;envoi du formulaire
            public. L&apos;admin reçoit aussi une notification e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Demande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Besoin</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.items.map((submission) => (
                <tr
                  className="border-b border-border text-slate-700"
                  key={submission._id}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {submission.productName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatDateTime(submission.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>{submission.email}</div>
                    <div className="mt-1">
                      {submission.phone || "Téléphone non renseigné"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>
                      {submission.platform} · {submission.requestType}
                    </div>
                    <div className="mt-1">
                      {submission.region} · {submission.budget}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[submission.status]}`}
                    >
                      {statusLabels[submission.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      aria-label={`Voir la soumission ${submission.productName}`}
                      className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      href={`/admin/soumissions/${submission._id}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {submissions.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Aucune soumission n&apos;est disponible pour le moment.
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
