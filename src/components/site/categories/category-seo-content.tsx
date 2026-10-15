import Link from "next/link";
import type { ReactNode } from "react";

import type { CategoryFaqItem, CategorySeoSection } from "@/models/category.model";

interface CategoryContentFallback {
  categoryName: string;
  products: Array<{ slug: string; title: string }>;
  totalItems: number;
}

// Paragraphs are plain text where internal links are written `[anchor](/path)`.
const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function renderParagraph(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [raw, anchor, href] = match;

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <Link
        key={`${href}-${match.index}`}
        href={href}
        className="font-semibold text-[#012D69] underline underline-offset-2 hover:text-brand-navy"
      >
        {anchor}
      </Link>,
    );
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function CategorySeoContent({
  sections,
  faq,
  fallback,
}: {
  sections: CategorySeoSection[];
  faq: CategoryFaqItem[];
  fallback?: CategoryContentFallback;
}) {
  if (sections.length === 0 && faq.length === 0 && !fallback) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1350px] px-6 pb-14 text-[#012D69]">
      <div className="max-w-4xl space-y-8">
        {sections.length === 0 && fallback ? (
          <div>
            <h2 className="font-heading text-xl font-black">
              Choisir {fallback.categoryName} : offres et plateformes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#012D69]/80">
              Cette rubrique rassemble {fallback.totalItems}{" "}
              {fallback.totalItems > 1 ? "offres" : "offre"} actuellement{" "}
              {fallback.totalItems > 1 ? "disponibles" : "disponible"}. Comparez
              les produits proposés et consultez leur fiche avant de choisir.
              {fallback.products.length > 0 ? (
                <>
                  {" "}Parmi les offres visibles :{" "}
                  {fallback.products.map((product, index) => (
                    <span key={product.slug}>
                      {index > 0 ? ", " : ""}
                      <Link
                        className="font-semibold text-[#012D69] underline underline-offset-2 hover:text-brand-navy"
                        href={`/produits/${product.slug}`}
                      >
                        {product.title}
                      </Link>
                    </span>
                  ))}
                  .
                </>
              ) : null}
            </p>

            <h3 className="mt-6 font-heading text-base font-bold">
              Format, compatibilité et zone de validité
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#012D69]/80">
              Vérifiez sur chaque fiche la plateforme, la région d’activation, le
              format du produit et le mode de livraison. Ces informations peuvent
              varier d’une offre à l’autre. Vous pouvez également consulter{" "}
              <Link
                className="font-semibold text-[#012D69] underline underline-offset-2 hover:text-brand-navy"
                href="/produits"
              >
                l’ensemble du catalogue PlaysDepot
              </Link>
              .
            </p>
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-heading text-xl font-black">{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-sm leading-relaxed text-[#012D69]/80"
              >
                {renderParagraph(paragraph)}
              </p>
            ))}
          </div>
        ))}

        {faq.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-black">
              Questions fréquentes
            </h2>
            {faq.map((item) => (
              <div key={item.question} className="mt-5">
                <h3 className="font-heading text-base font-bold">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#012D69]/80">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
