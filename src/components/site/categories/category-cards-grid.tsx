"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Plus } from "lucide-react";
import { useState } from "react";

import { buildProductsHref } from "@/lib/utils/catalog-links";
import type { CategoriesPageCategory } from "@/services/categories.service";

const CATEGORIES_PER_PAGE = 8;

export function CategoryCardsGrid({
  categories,
}: {
  categories: CategoriesPageCategory[];
}) {
  const [visibleCount, setVisibleCount] = useState(CATEGORIES_PER_PAGE);
  const visibleCategories = categories.slice(0, visibleCount);
  const remainingCount = categories.length - visibleCategories.length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {visibleCategories.map((category) => (
        <CategoryCard category={category} key={category.id} />
      ))}

      {remainingCount > 0 ? (
        <button
          className="group flex min-h-[158px] flex-col items-center justify-center gap-4 border-2 border-dashed border-[#012D69]/25 bg-white/55 p-5 text-center text-[#012D69] shadow-[0_14px_34px_rgba(1,45,105,0.08)] transition hover:-translate-y-1 hover:border-[#A681F0] hover:bg-white hover:shadow-[0_18px_42px_rgba(1,45,105,0.16)]"
          onClick={() =>
            setVisibleCount((count) =>
              Math.min(count + CATEGORIES_PER_PAGE, categories.length),
            )
          }
          type="button"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-[#E7DAFF] transition group-hover:bg-[#B0A4F5]">
            <Plus className="size-9 transition group-hover:scale-110" />
          </span>
          <span>
            <span className="block font-body text-xs font-bold uppercase tracking-[0.08em]">
              Afficher plus
            </span>
            <span className="mt-2 block text-[11px] font-semibold text-[#00061E]/55">
              {Math.min(CATEGORIES_PER_PAGE, remainingCount)} catégories
              supplémentaires
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}

function CategoryCard({ category }: { category: CategoriesPageCategory }) {
  return (
    <Link
      className="group flex min-h-[158px] flex-col items-center justify-center gap-4 bg-white p-5 text-center shadow-[0_14px_34px_rgba(1,45,105,0.14)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(1,45,105,0.2)]"
      href={buildProductsHref(category.slug)}
    >
      {category.image ? (
        <span className="relative size-16 overflow-hidden">
          <Image
            alt={category.label}
            className="object-contain transition group-hover:scale-110"
            fill
            sizes="64px"
            src={category.image}
          />
        </span>
      ) : (
        <span className="flex size-16 items-center justify-center rounded-2xl bg-[#E7DAFF] text-[#012D69]">
          <Gamepad2 className="size-9 transition group-hover:scale-110" />
        </span>
      )}
      <div>
        <h2 className="font-body text-xs font-bold uppercase tracking-[0.08em] text-[#012D69]">
          {category.label}
        </h2>
        {category.description ? (
          <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-[#00061E]/55">
            {category.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
