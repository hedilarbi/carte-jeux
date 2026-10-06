import Link from "next/link";
import type { ReactNode } from "react";

import type { CategoryFaqItem, CategorySeoSection } from "@/models/category.model";

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
}: {
  sections: CategorySeoSection[];
  faq: CategoryFaqItem[];
}) {
  if (sections.length === 0 && faq.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1350px] px-6 pb-14 text-[#012D69]">
      <div className="max-w-4xl space-y-8">
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
