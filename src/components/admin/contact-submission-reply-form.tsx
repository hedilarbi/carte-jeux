"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { ContactSubmission } from "@/types/entities";

interface ContactSubmissionReplyFormProps {
  submissionId: string;
}

export function ContactSubmissionReplyForm({
  submissionId,
}: ContactSubmissionReplyFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await fetchJson<ContactSubmission>(
        `/api/admin/contact-submissions/${submissionId}/reply`,
        {
          body: JSON.stringify({ message }),
          method: "POST",
        },
      );
      setMessage("");
      setSuccess("Réponse envoyée au client.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'envoyer la réponse.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Réponse par e-mail
        </span>
        <Textarea
          maxLength={4000}
          minLength={10}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Votre réponse au client..."
          required
          rows={8}
          value={message}
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </p>
      ) : null}

      <Button className="w-fit" disabled={isSubmitting} type="submit">
        <Send className="size-4" />
        {isSubmitting ? "Envoi..." : "Envoyer la réponse"}
      </Button>
    </form>
  );
}
