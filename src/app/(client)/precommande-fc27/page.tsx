import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GtaViPreorderForm } from "@/components/site/preorder/gta-vi-preorder-form";

export const metadata: Metadata = {
  title: "Précommande EA Sports FC27",
  description:
    "Inscrivez-vous pour être contacté dès l'ouverture des précommandes EA Sports FC27.",
};

export default function Fc27PreorderPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <section className="mx-auto grid max-w-[1350px] gap-8 px-6 py-10 lg:min-h-[calc(100svh-120px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.72fr)] lg:items-center lg:py-14">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-[#012D69] transition hover:bg-white"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="mt-7">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-[#4D3B94]">
              EA Sports FC27
            </p>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black leading-tight text-[#012D69] md:text-5xl">
              Précommande FC27
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#012D69]/75 md:text-lg">
              Remplissez le formulaire et notre équipe vous contactera dès que
              la précommande FC27 sera ouverte.
            </p>
          </div>

          <div className="relative mt-8 aspect-[4000/1667] overflow-hidden rounded-[30px] border border-white/55 bg-white/40 shadow-[0_24px_70px_rgba(1,45,105,0.18)]">
            <Image
              alt="Précommande EA Sports FC27"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 760px"
              src="/bg-fc27.jpg"
            />
          </div>
        </div>

        <GtaViPreorderForm
          apiPath="/api/precommandes/fc27"
          productLabel="FC27"
        />
      </section>
    </main>
  );
}
