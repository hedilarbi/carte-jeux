"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

import { PhoneNumberField } from "@/components/site/auth/phone-number-field";
import { fetchJson } from "@/lib/utils/fetch-json";
import type { GtaPreorder } from "@/types/entities";

const inputClassName =
  "h-12 rounded-xl border border-[#012D69]/15 bg-white px-4 text-sm font-semibold text-[#012D69] outline-none transition placeholder:text-[#012D69]/40 focus:border-[#78DAFF] focus:ring-4 focus:ring-[#78DAFF]/20";

export function GtaViPreorderForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    setError(null);
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      await fetchJson<GtaPreorder>("/api/precommandes/gta-vi", {
        body: JSON.stringify(payload),
        method: "POST",
      });

      form.reset();
      setResetKey((current) => current + 1);
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer votre précommande.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-[28px] border border-white/60 bg-white/82 p-5 shadow-[0_24px_70px_rgba(1,45,105,0.18)] backdrop-blur md:p-7"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#4D3B94]">
          Précommande
        </p>
        <h2 className="mt-2 font-heading text-2xl font-black text-[#012D69]">
          GTA VI
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#012D69]/70">
          Laissez vos coordonnées. Nous vous contacterons dès que la
          précommande sera disponible.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Prénom"
          name="firstName"
          placeholder="Votre prénom"
          required
        />
        <TextField
          label="Nom"
          name="lastName"
          placeholder="Votre nom"
          required
        />
      </div>

      <TextField
        label="Email"
        name="email"
        placeholder="votre@email.com"
        required
        type="email"
      />

      <div key={resetKey}>
        <PhoneNumberField name="phone" />
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      {isSuccess ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-4" />
          Votre précommande GTA VI a été enregistrée.
        </p>
      ) : null}

      <button
        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#78DAFF] px-5 font-heading text-sm font-black uppercase tracking-[0.08em] text-[#012D69] shadow-[0_14px_28px_rgba(120,218,255,0.34)] transition hover:-translate-y-0.5 hover:bg-[#A2E8FF] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        <Send className="size-4" />
        {isSubmitting ? "Enregistrement..." : "Précommander"}
      </button>
    </form>
  );
}

function TextField({
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#012D69]">
      {label}
      <input
        className={inputClassName}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}
