import Link from "next/link";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question:
      "Comment acheter des jeux et recharges gaming en Tunisie sans carte bancaire internationale ?",
    answer:
      "Notre plateforme permet d'acheter des codes Steam, cartes PSN, Xbox et Nintendo avec des moyens de paiement locaux en dinars tunisiens.\nVous sélectionnez votre produit, vous payez via une solution disponible en Tunisie, et le code est livré immédiatement. Aucun paiement international n'est requis.",
  },
  {
    question: "Les codes fonctionnent-ils en Tunisie ?",
    answer:
      "Oui. Tous les codes proposés sont authentiques, vérifiés et activables.\nIls ne sont pas bloqués par pays mais liés à une région (Europe, USA, etc.). Il suffit d'utiliser un compte correspondant à la région du code. Cette configuration est simple et largement utilisée en Tunisie.",
  },
  {
    question: "Comment fonctionne la livraison des codes ?",
    answer:
      "La livraison est entièrement automatisée. Une fois le paiement validé, le code est :\n- affiché directement sur votre écran\n- envoyé par email\nLa réception est immédiate, généralement en quelques secondes.",
  },
  {
    question: "Que se passe-t-il si un code ne fonctionne pas ?",
    answer:
      "Tous les codes sont testés en amont, mais en cas de problème :\n- vous contactez le support avec votre preuve d'achat\n- une vérification est effectuée rapidement\n- si le code est invalide ou inutilisable, un remplacement ou un remboursement est proposé\nLe traitement est prioritaire afin de garantir une résolution rapide.",
  },
  {
    question: "Quels types de produits sont disponibles ?",
    answer:
      "Nous proposons uniquement des produits digitaux officiels :\n- cartes de recharge (PSN, Steam, Xbox, Nintendo)\n- clés de jeux (activation directe)\n- abonnements (PlayStation Plus, Xbox Game Pass, Nintendo Switch Online)\nChaque produit est clairement indiqué avec sa plateforme et sa compatibilité.",
  },
  {
    question: "Pourquoi utiliser ce service en Tunisie ?",
    answer:
      "L'accès aux stores internationaux est limité par les moyens de paiement.\nNotre service permet de :\n- payer en dinars tunisiens\n- accéder aux plateformes internationales\n- recevoir instantanément les codes\n- éviter les contraintes liées aux cartes bancaires étrangères",
  },
  {
    question: "Les codes sont-ils sécurisés et fiables ?",
    answer:
      "Oui. Les codes proviennent de fournisseurs vérifiés et suivent un circuit de distribution standard.\nIls sont uniques, non utilisés et valides au moment de la livraison.",
  },
  {
    question: "Peut-on utiliser ces codes immédiatement après achat ?",
    answer:
      "Oui. Dès réception, le code peut être activé sur votre compte.\nL'accès au jeu ou au crédit est instantané après activation.",
  },
  {
    question:
      "Les abonnements comme PlayStation Plus ou Xbox Game Pass sont-ils disponibles ?",
    answer:
      "Oui. Les abonnements sont proposés sous forme de codes activables, permettant un accès complet aux services, même depuis la Tunisie avec un compte compatible.",
  },
  {
    question: "Comment être sûr de choisir le bon produit ?",
    answer:
      "Chaque produit correspond à une plateforme précise :\n- PlayStation -> carte PSN / abonnement PlayStation Plus\n- PC -> carte Steam ou clé de jeu\n- Xbox -> carte Xbox ou Game Pass\n- Nintendo -> carte eShop\nLes informations sont indiquées sur chaque fiche produit pour éviter toute erreur.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-brand-navy py-16" id="faq">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase text-brand-lavender">
            {"// FAQ"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-lilac md:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-brand-periwinkle">
            Les réponses essentielles avant d&apos;acheter une recharge, une gift card
            ou un abonnement gaming.
          </p>

          <Link
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-lavender/35 bg-brand-lavender/12 px-5 font-heading text-xs font-bold uppercase text-brand-lavender transition hover:bg-brand-lavender hover:text-brand-navy"
            href="https://wa.me/21600000000"
            target="_blank"
          >
            <MessageCircle className="size-4" />
            Support WhatsApp
          </Link>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <details
              className="group rounded-xl border border-white/7 bg-[#0F0F28] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition open:border-brand-lavender/45"
              key={faq.question}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lavender/12 text-brand-lavender">
                    <HelpCircle className="size-4" />
                  </span>
                  <span className="text-sm font-bold text-brand-lilac">
                    {faq.question}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-brand-periwinkle transition group-open:rotate-180 group-open:text-brand-lavender" />
              </summary>
              <p className="whitespace-pre-line border-t border-white/7 px-5 pb-5 pt-4 text-sm leading-7 text-brand-periwinkle">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
