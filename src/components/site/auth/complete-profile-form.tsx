"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { PhoneNumberField } from "@/components/site/auth/phone-number-field";

type CompleteProfileUser = {
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

async function postJson<T>(endpoint: string, body: Record<string, unknown>) {
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

  return payload.data as T;
}

export function CompleteProfileForm({
  user,
}: {
  user: CompleteProfileUser;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const data = await postJson<{ user: CompleteProfileUser }>(
        "/api/auth/complete-profile",
        body,
      );

      window.dispatchEvent(
        new CustomEvent("auth:updated", {
          detail: { user: data.user },
        }),
      );
      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible de compléter votre profil.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#012D69]">
          Prénom
          <input
            autoComplete="given-name"
            className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
            defaultValue={user.firstName}
            maxLength={80}
            name="firstName"
            placeholder="Votre prénom"
            required
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#012D69]">
          Nom
          <input
            autoComplete="family-name"
            className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
            defaultValue={user.lastName}
            maxLength={80}
            name="lastName"
            placeholder="Votre nom"
            required
            type="text"
          />
        </label>
      </div>

      <PhoneNumberField defaultValue={user.phone} />

      {error ? (
        <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className={cn(
          "mt-2 flex h-13 items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 text-center font-body text-sm font-bold uppercase leading-[1] text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]",
          isPending && "cursor-wait opacity-70",
        )}
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Enregistrement..." : "Compléter mon profil"}
      </button>
    </form>
  );
}
