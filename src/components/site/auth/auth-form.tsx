"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type AuthFormField = {
  autoComplete: string;
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password" | "text";
};

type AuthFormProps = {
  endpoint: string;
  fields: AuthFormField[];
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  hiddenFields?: Record<string, string | undefined>;
  submitLabel: string;
  successRedirect?: string;
  successText?: string;
};

export function AuthForm({
  endpoint,
  fields,
  forgotPasswordHref,
  forgotPasswordLabel = "Mot de passe oublié ?",
  hiddenFields,
  submitLabel,
  successRedirect,
  successText = "Opération réussie.",
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<
    Record<string, boolean>
  >({});
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function togglePasswordVisibility(fieldName: string) {
    setVisiblePasswordFields((current) => ({
      ...current,
      [fieldName]: !current[fieldName],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResetUrl(null);
    setSuccess(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Une erreur est survenue.");
      }

      if (payload?.data?.resetUrl) {
        setResetUrl(payload.data.resetUrl);
      }

      setSuccess(successText);

      if (payload?.data && "user" in payload.data) {
        window.dispatchEvent(
          new CustomEvent("auth:updated", {
            detail: { user: payload.data.user },
          }),
        );
      }

      if (successRedirect) {
        router.push(successRedirect);
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value ?? ""} />
          ))
        : null}

      {fields.map((field) => (
        <label
          className="grid gap-2 text-sm font-bold text-[#012D69]"
          key={field.name}
        >
          {field.label}
          {field.type === "password" ? (
            <span className="relative block">
              <input
                autoComplete={field.autoComplete}
                className="h-12 w-full rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 pr-12 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
                name={field.name}
                placeholder={field.placeholder}
                required
                type={visiblePasswordFields[field.name] ? "text" : "password"}
              />
              <button
                aria-label={
                  visiblePasswordFields[field.name]
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#012D69]/60 transition hover:bg-[#DADDFF]/45 hover:text-[#012D69]"
                onClick={() => togglePasswordVisibility(field.name)}
                type="button"
              >
                {visiblePasswordFields[field.name] ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </span>
          ) : (
            <input
              autoComplete={field.autoComplete}
              className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
              name={field.name}
              placeholder={field.placeholder}
              required
              type={field.type}
            />
          )}
          {field.name === "password" && forgotPasswordHref ? (
            <Link
              className="justify-self-end font-inter text-xs font-black text-[#8258CB] transition hover:text-[#012D69] hover:underline"
              href={forgotPasswordHref}
            >
              {forgotPasswordLabel}
            </Link>
          ) : null}
        </label>
      ))}

      {error ? (
        <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <p>{success}</p>
          {resetUrl ? (
            <a
              className="mt-2 block break-all text-[#012D69] underline"
              href={resetUrl}
            >
              {resetUrl}
            </a>
          ) : null}
        </div>
      ) : null}

      <button
        className={cn(
          "mt-2 flex h-13 items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]",
          isPending && "cursor-wait opacity-70",
        )}
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Veuillez patienter..." : submitLabel}
      </button>
    </form>
  );
}
