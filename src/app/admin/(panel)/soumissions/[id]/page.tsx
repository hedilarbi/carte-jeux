import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContactSubmissionReplyForm } from "@/components/admin/contact-submission-reply-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppError } from "@/lib/utils/app-error";
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

async function getSubmissionOrNotFound(id: string) {
  try {
    return await contactSubmissionService.getById(id);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function AdminContactSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionOrNotFound(id);

  return (
    <>
      <AdminPageHeader
        actions={
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/admin/soumissions"
          >
            <ArrowLeft className="size-4" />
            Retour
          </Link>
        }
        eyebrow="Support"
        title={submission.productName}
        description="Consultez le détail de la demande et répondez directement au client par e-mail."
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Détail de la soumission</CardTitle>
                <CardDescription className="mt-2">
                  Envoyée le {formatDateTime(submission.createdAt)}.
                </CardDescription>
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[submission.status]}`}
              >
                {statusLabels[submission.status]}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Produit recherché" value={submission.productName} />
              <InfoItem label="Plateforme" value={submission.platform} />
              <InfoItem label="Type de demande" value={submission.requestType} />
              <InfoItem label="Région" value={submission.region} />
              <InfoItem label="Budget" value={submission.budget} />
              <InfoItem label="Paiement" value={submission.payment} />
              <InfoItem label="E-mail" value={submission.email} />
              <InfoItem
                label="Téléphone"
                value={submission.phone || "Non renseigné"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4" />
              Répondre
            </CardTitle>
            <CardDescription className="mt-2">
              Le message sera envoyé à {submission.email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactSubmissionReplyForm submissionId={submission._id} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des réponses</CardTitle>
          <CardDescription className="mt-2">
            Les réponses envoyées depuis cette interface sont conservées ici.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {submission.replies.length > 0 ? (
            submission.replies.map((reply, index) => (
              <article
                className="rounded-2xl border border-border bg-slate-50 p-4"
                key={reply._id || `${reply.sentAt}-${index}`}
              >
                <div className="flex flex-col gap-1 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                  <span>Envoyée à {reply.sentTo}</span>
                  <span>{formatDateTime(reply.sentAt)}</span>
                </div>
                {reply.adminEmail ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Admin: {reply.adminEmail}
                  </p>
                ) : null}
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {reply.message}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              Aucune réponse envoyée pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
