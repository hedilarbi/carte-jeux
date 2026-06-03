"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.dispatchEvent(
        new CustomEvent("auth:updated", {
          detail: { user: null },
        }),
      );
      router.push("/connexion");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#B0A4F5] px-6 font-body text-sm font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED] disabled:cursor-wait disabled:opacity-70"
      disabled={isPending}
      onClick={handleLogout}
      type="button"
    >
      <LogOut className="size-4" />
      {isPending ? "Déconnexion..." : "Déconnexion"}
    </button>
  );
}
