"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { PhoneNumberField } from "@/components/site/auth/phone-number-field";

type RegisterResponse = {
  email: string;
  otpExpiresAt: string;
  resendAvailableAt: string;
  requiresOtp: boolean;
};

type VerifyResponse = {
  user: {
    email: string;
  };
};

function getRemainingSeconds(value?: string | null) {
  if (!value) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
}

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

export function RegistrationOtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<string | null>(null);
  const [, setResendTick] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<"register" | "otp">("register");

  const resendRemainingSeconds = getRemainingSeconds(resendAvailableAt);

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    const interval = window.setInterval(() => {
      setResendTick((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [step]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const data = await postJson<RegisterResponse>("/api/auth/register", body);

      setEmail(data.email);
      setOtp("");
      setOtpExpiresAt(data.otpExpiresAt);
      setResendAvailableAt(data.resendAvailableAt);
      setStep("otp");
      setSuccess("Un code de vérification a été envoyé par e-mail.");
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

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const data = await postJson<VerifyResponse>(
        "/api/auth/verify-registration-otp",
        {
          email,
          otp,
        },
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
          : "Une erreur est survenue.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleResend() {
    if (isResending || resendRemainingSeconds > 0) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const data = await postJson<RegisterResponse>(
        "/api/auth/resend-registration-otp",
        {
          email,
        },
      );

      setOtpExpiresAt(data.otpExpiresAt);
      setResendAvailableAt(data.resendAvailableAt);
      setSuccess("Un nouveau code a été envoyé.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsResending(false);
    }
  }

  if (step === "otp") {
    return (
      <form className="grid gap-4" key="otp-form" onSubmit={handleVerify}>
        <div className="rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 py-3 font-inter text-sm font-semibold text-[#012D69]">
          Code envoyé à <span className="font-black">{email}</span>
          {otpExpiresAt ? (
            <span className="mt-1 block text-xs text-[#012D69]/58">
              Le code expire à {new Date(otpExpiresAt).toLocaleTimeString("fr-FR")}.
            </span>
          ) : null}
        </div>

        <label className="grid gap-2 text-sm font-bold text-[#012D69]">
          Code OTP
          <input
            autoComplete="off"
            className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 text-center font-inter text-lg font-black tracking-[0.32em] text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
            inputMode="numeric"
            maxLength={6}
            name="otp"
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            pattern="[0-9]{6}"
            required
            type="text"
            value={otp}
          />
        </label>

        {error ? (
          <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {success}
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
          {isPending ? "Vérification..." : "Vérifier le code"}
        </button>

        <button
          className="text-center font-inter text-sm font-black text-[#012D69] transition hover:text-[#8258CB] disabled:cursor-wait disabled:text-[#012D69]/40"
          disabled={isResending || resendRemainingSeconds > 0}
          onClick={handleResend}
          type="button"
        >
          {resendRemainingSeconds > 0
            ? `Renvoyer le code dans ${resendRemainingSeconds}s`
            : isResending
              ? "Envoi..."
              : "Renvoyer le code"}
        </button>
      </form>
    );
  }

  return (
    <form className="grid gap-4" key="register-form" onSubmit={handleRegister}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#012D69]">
          Prénom
          <input
            autoComplete="given-name"
            className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
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
            maxLength={80}
            name="lastName"
            placeholder="Votre nom"
            required
            type="text"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[#012D69]">
        Email
        <input
          autoComplete="email"
          className="h-12 rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
          name="email"
          placeholder="votre@email.com"
          required
          type="email"
        />
      </label>

      <PhoneNumberField />

      <label className="grid gap-2 text-sm font-bold text-[#012D69]">
        Mot de passe
        <span className="relative block">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 pr-12 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
            name="password"
            placeholder="Créer un mot de passe"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#012D69]/60 transition hover:bg-[#DADDFF]/45 hover:text-[#012D69]"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </span>
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#012D69]">
        Confirmer le mot de passe
        <span className="relative block">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-[14px] border border-[#DADDFF] bg-[#F8F9FF] px-4 pr-12 font-inter text-sm font-semibold text-[#00061E] outline-none transition placeholder:text-[#012D69]/35 focus:border-[#A582ED] focus:bg-white focus:ring-4 focus:ring-[#A582ED]/16"
            name="passwordConfirmation"
            placeholder="Répéter le mot de passe"
            required
            type={showPasswordConfirmation ? "text" : "password"}
          />
          <button
            aria-label={
              showPasswordConfirmation
                ? "Masquer la confirmation du mot de passe"
                : "Afficher la confirmation du mot de passe"
            }
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#012D69]/60 transition hover:bg-[#DADDFF]/45 hover:text-[#012D69]"
            onClick={() =>
              setShowPasswordConfirmation((current) => !current)
            }
            type="button"
          >
            {showPasswordConfirmation ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </span>
      </label>

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
        {isPending ? "Envoi du code..." : "Créer le compte"}
      </button>
    </form>
  );
}
