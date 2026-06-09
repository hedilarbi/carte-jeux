import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mentions légales | PlaysDepot",
  description:
    "Mentions légales de PlaysDepot, plateforme éditée par OPTIN DEVELOPPEMENT.",
};

const editorRows = [
  ["Dénomination", "OPTIN DEVELOPPEMENT"],
  ["Forme juridique", "SARL"],
  ["Identifiant RNE", "1490374M"],
  ["Siège social", "2037 Ariana, Tunisie"],
  ["Email de contact", "contact@playsdepot.tn"],
];

const hostRows = [
  ["Dénomination", "[NOM HÉBERGEUR — À COMPLÉTER]"],
  ["Adresse", "[ADRESSE HÉBERGEUR — À COMPLÉTER]"],
  ["Contact", "[EMAIL / TEL — À COMPLÉTER]"],
];

export default function LegalNoticePage() {
  return (
    <main className="bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] text-[#00061E]">
      <section className="mx-auto max-w-[1040px] px-6 py-16 md:py-20">
        <div className="rounded-[24px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(1,45,105,0.12)] backdrop-blur md:p-10">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#012D69]">
            www.playsdepot.tn
          </p>
          <h1 className="mt-4 font-heading text-3xl font-black uppercase leading-tight text-[#012D69] md:text-5xl">
            Mentions légales
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#012D69]/70">
            Version 1.0 | Juin 2026
          </p>

          <div className="mt-10 grid gap-8">
            <LegalSection title="1. Éditeur du site">
              <LegalTable
                firstHeader="Éditeur"
                rows={editorRows}
                secondHeader="Informations"
              />
            </LegalSection>

            <LegalSection title="2. Directeur de la publication">
              <p>
                Le directeur de la publication est le gérant de la société
                OPTIN DEVELOPPEMENT.
              </p>
              <p className="mt-3">Contact : contact@playsdepot.tn</p>
            </LegalSection>

            <LegalSection title="3. Hébergement">
              <LegalTable
                firstHeader="Hébergeur"
                rows={hostRows}
                secondHeader="Informations"
              />
            </LegalSection>

            <LegalSection title="4. Propriété intellectuelle">
              <p>
                L&apos;ensemble des éléments de la plateforme PLAYSDEPOT (nom,
                logo, design, textes, architecture) est la propriété exclusive
                d&apos;OPTIN DEVELOPPEMENT ou de ses concédants. Toute
                reproduction non autorisée est interdite.
              </p>
              <p className="mt-4">
                Les marques tierces mentionnées (PlayStation, Xbox, Steam, Epic
                Games, Riot Games, Roblox, etc.) appartiennent à leurs
                détenteurs respectifs. Leur mention n&apos;implique aucun
                partenariat officiel avec PLAYSDEPOT.
              </p>
            </LegalSection>

            <LegalSection title="5. Données personnelles et cookies">
              <p>
                Les données collectées (email, historique de commande) sont
                traitées conformément au RGPD (UE 2016/679) et à la loi
                tunisienne n°63-2004 relative à la protection des données
                personnelles.
              </p>
              <p className="mt-4">
                Pour exercer vos droits d&apos;accès, rectification ou
                suppression, ou pour toute question relative aux cookies,
                consultez notre Politique de Confidentialité ou contactez :
                dpo@playsdepot.tn
              </p>
            </LegalSection>

            <LegalSection title="6. Limitation de responsabilité">
              <p>
                PLAYSDEPOT est un revendeur indépendant de codes et crédits
                numériques. OPTIN DEVELOPPEMENT n&apos;est affiliée à aucun
                éditeur tiers. Sa responsabilité est limitée au montant de la
                commande concernée.
              </p>
            </LegalSection>
          </div>

          <p className="mt-12 border-t border-[#012D69]/12 pt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#012D69]/70">
            PLAYSDEPOT — OPTIN DEVELOPPEMENT — Juin 2026
          </p>
        </div>
      </section>
    </main>
  );
}

function LegalSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-black text-[#012D69]">
        {title}
      </h2>
      <div className="mt-4 text-sm font-medium leading-7 text-[#00061E]/82 md:text-base">
        {children}
      </div>
    </section>
  );
}

function LegalTable({
  firstHeader,
  rows,
  secondHeader,
}: {
  firstHeader: string;
  rows: string[][];
  secondHeader: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#012D69]/12 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#012D69] text-white">
          <tr>
            <th className="px-4 py-3 font-heading text-xs uppercase tracking-[0.14em]">
              {firstHeader}
            </th>
            <th className="px-4 py-3 font-heading text-xs uppercase tracking-[0.14em]">
              {secondHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr className="border-t border-[#012D69]/10" key={label}>
              <td className="w-1/3 px-4 py-3 font-bold text-[#012D69]">
                {label}
              </td>
              <td className="px-4 py-3 text-[#00061E]/78">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
