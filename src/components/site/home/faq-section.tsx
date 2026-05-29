import { ChevronDown, HelpCircle, Send } from "lucide-react";

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
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-2 lg:items-start">
        <div className="order-2 rounded-[17px] border border-white/10 bg-white/13 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur md:p-7 lg:min-h-[675px]">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-lavender">
            {"// Demande produit"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-brand-lilac md:text-3xl">
            Vous ne trouvez pas votre jeu ou votre recharge ?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-periwinkle">
            Indiquez-nous votre besoin (Steam, PSN, Xbox, Nintendo ou mobile).
            Nous vous répondons rapidement avec une solution adaptée, disponible
            en Tunisie avec paiement en dinars.
          </p>

          <form className="mt-7 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Plateforme"
                name="platform"
                options={["Steam", "PSN", "Xbox", "Nintendo", "Mobile"]}
              />
              <SelectField
                label="Type de demande"
                name="requestType"
                options={[
                  "Carte de recharge",
                  "Clé de jeu",
                  "Abonnement",
                  "Recharge mobile",
                ]}
              />
            </div>

            <TextField
              label="Nom du jeu/produit recherché"
              name="productName"
              placeholder="Ex: FC 26, carte PSN 20 EUR..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Région souhaitée*"
                name="region"
                options={["Europe", "USA", "Global", "Turquie", "Autre"]}
              />
              <SelectField
                label="Budget"
                name="budget"
                options={[
                  "Moins de 25 DT",
                  "25 - 50 DT",
                  "50 - 100 DT",
                  "100 - 200 DT",
                  "Plus de 200 DT",
                ]}
              />
            </div>

            <SelectField
              label="Mode de paiement disponible"
              name="payment"
              options={["D17", "Flouci", "e-Dinar", "Virement", "WhatsApp"]}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Email"
                name="email"
                placeholder="votre@email.com"
                type="email"
              />
              <TextField
                label="Numéro de téléphone"
                name="phone"
                placeholder="+216 XX XXX XXX"
                type="tel"
              />
            </div>

            <button
              className="mt-2 inline-flex h-[53px] items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(274.47deg,#B99CF1_-12.06%,#7FCCFF_110.42%)] px-6 font-heading text-sm font-bold uppercase text-brand-dark  transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(185,152,241,0.45)]"
              type="submit"
            >
              <Send className="size-4" />
              Envoyer
            </button>
          </form>
        </div>

        <div className="order-1">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-lavender">
            {"// FAQ"}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-lilac md:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-brand-periwinkle">
            Les réponses essentielles avant d&apos;acheter une recharge, une
            gift card ou un abonnement gaming.
          </p>

          <div className="mt-7 grid gap-3">
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
      </div>
    </section>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-brand-lilac/75">
        {label}
      </span>
      <select
        className="h-12 rounded-xl border border-white/10 bg-[#0F0F28]/75 px-4 text-sm font-semibold text-brand-lilac outline-none focus:border-brand-lavender/55"
        defaultValue=""
        name={name}
      >
        <option disabled value="">
          Sélectionner
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: "email" | "tel" | "text";
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-brand-lilac/75">
        {label}
      </span>
      <input
        className="h-12 rounded-xl border border-white/10 bg-[#0F0F28]/75 px-4 text-sm font-semibold text-brand-lilac outline-none placeholder:text-brand-periwinkle/45 focus:border-brand-lavender/55"
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
