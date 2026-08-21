"use client";

import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchJson } from "@/lib/utils/fetch-json";

type VerificationState = "verifying" | "paid" | "failed";

export function CheckoutVerificationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("orderId");
  const [state, setState] = useState<VerificationState>(
    transactionId ? "verifying" : "failed",
  );
  const [message, setMessage] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!transactionId || hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    async function verify() {
      try {
        const result = await fetchJson<{
          failureReason: string | null;
          orderNumber: string;
          paymentStatus: "paid" | "failed" | "pending" | "refunded";
        }>("/api/payments/clictopay/verify", {
          method: "POST",
          body: JSON.stringify({ transactionId }),
        });

        if (result.paymentStatus === "paid") {
          setState("paid");
          window.dispatchEvent(
            new CustomEvent("cart:updated", { detail: { items: [] } }),
          );
          router.replace(
            `/checkout/success?order_number=${encodeURIComponent(result.orderNumber)}`,
          );
          return;
        }

        setState("failed");
        setMessage(result.failureReason ?? null);
      } catch (error) {
        setState("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "Impossible de vérifier le paiement.",
        );
      }
    }

    void verify();
  }, [router, transactionId]);

  return (
    <div className="w-full max-w-[600px] rounded-2xl bg-white/55 p-10 text-center shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
      {state === "verifying" ? (
        <>
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#B0A4F5] text-white">
            <Loader2 className="size-10 animate-spin" />
          </span>
          <h1 className="mt-6 font-heading text-3xl font-bold text-[#012D69]">
            Vérification du paiement...
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] font-inter text-base font-medium leading-7 text-black/70">
            Merci de ne pas fermer cette page.
          </p>
        </>
      ) : null}

      {state === "paid" ? (
        <>
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-500 text-white">
            <ShieldCheck className="size-10" />
          </span>
          <h1 className="mt-6 font-heading text-3xl font-bold text-[#012D69]">
            Paiement confirmé
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] font-inter text-base font-medium leading-7 text-black/70">
            Redirection en cours...
          </p>
        </>
      ) : null}

      {state === "failed" ? (
        <>
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-500 text-white">
            <XCircle className="size-10" />
          </span>
          <h1 className="mt-6 font-heading text-3xl font-bold text-[#012D69]">
            Paiement non abouti
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] font-inter text-base font-medium leading-7 text-black/70">
            {message ??
              "La transaction n'a pas pu être validée. Aucun montant ne vous a été débité."}
          </p>
          <Link
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-6 font-body text-base font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
            href="/panier"
          >
            Retourner au panier
          </Link>
        </>
      ) : null}
    </div>
  );
}
