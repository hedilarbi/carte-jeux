import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Heart, ShoppingCart } from "lucide-react";

import { AddToCartButton } from "@/components/site/add-to-cart-button";
import { FavoriteButton } from "@/components/site/favorites/favorite-button";
import { FAVORITE_SESSION_COOKIE } from "@/lib/auth/favorite-session";
import { getCustomerPageSession } from "@/lib/auth/customer";
import { favoritesService } from "@/services/favorites.service";
import type { FavoriteItem, FavoriteList } from "@/types/entities";

async function getCurrentFavorites(): Promise<FavoriteList> {
  const [cookieStore, customerSession] = await Promise.all([
    cookies(),
    getCustomerPageSession(),
  ]);
  const sessionId = cookieStore.get(FAVORITE_SESSION_COOKIE)?.value;

  return favoritesService.get({
    ...(customerSession ? { userId: customerSession.userId } : {}),
    ...(!customerSession && sessionId ? { sessionId } : {}),
  });
}

function formatPrice(value: number) {
  return value.toFixed(3);
}

export default async function FavoritesPage() {
  const favorites = await getCurrentFavorites();

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] px-6 py-12 text-[#00061E]">
      <section className="mx-auto max-w-[1350px]">
        <div className="mb-8">
          <span className="font-mono text-[11px] font-bold uppercase text-[#012D69]/70">
            {"// Favoris"}
          </span>
          <h1 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-[0.04em] text-[#012D69]">
            Vos produits favoris
          </h1>
        </div>

        {favorites.items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.items.map((item) => (
              <FavoriteCard item={item} key={item.productId} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center bg-white/45 p-8 text-center shadow-[0_4px_4px_#B1A3F5] backdrop-blur-sm">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#012D69] text-white">
              <Heart className="size-7" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-[#012D69]">
              Aucun favori pour le moment
            </h2>
            <p className="mt-3 max-w-[440px] text-sm font-semibold leading-6 text-[#00061E]/65">
              Ajoutez vos produits préférés depuis l&apos;accueil ou le catalogue.
            </p>
            <Link
              className="mt-6 inline-flex h-12 items-center justify-center rounded-[14px] bg-[#B0A4F5] px-6 font-body text-sm font-bold uppercase text-black shadow-[0_4px_8.6px_-1px_rgba(1,45,105,0.63)] transition hover:bg-[#A582ED]"
              href="/produits"
            >
              Voir les produits
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function FavoriteCard({ item }: { item: FavoriteItem }) {
  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-[#A582ED] bg-white shadow-[0_18px_38px_rgba(130,88,203,0.22)] transition hover:-translate-y-1">
      <Link
        aria-label={`Voir le produit - ${item.productTitle}`}
        className="absolute inset-0 z-[1]"
        href={`/produits/${item.productSlug}`}
      />

      <div className="relative aspect-[625/873] bg-white">
        <Image
          alt={item.productTitle}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 280px"
          src={item.productImage ?? "/jeu1.jpg"}
        />
      </div>

      <div className="relative z-[2] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs font-bold uppercase text-[#012D69]">
            {item.platformName ?? "Global"}
          </p>
          <FavoriteButton
            aria-label={`Retirer ${item.productTitle} des favoris`}
            activeClassName="bg-danger text-white"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#012D69]/8 text-danger shadow-[0_8px_20px_rgba(1,45,105,0.12)] transition hover:bg-danger hover:text-white"
            productId={item.productId}
            productSlug={item.productSlug}
            refreshOnChange
          />
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-10 font-body text-sm font-extrabold leading-5 text-[#1F0A4D]">
          {item.productTitle}
        </h2>
        <p className="mt-4 font-body text-xl font-black text-[#1F0A4D]">
          {formatPrice(item.price)}{" "}
          <span className="font-body text-[11px] text-[#6F6288]">
            {item.currency}
          </span>
        </p>

        <AddToCartButton
          className="relative z-20 mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#B0A4F5] px-4 text-xs font-extrabold text-white transition hover:bg-[#A582ED]"
          productId={item.productId}
          productSlug={item.productSlug}
        >
          <ShoppingCart className="size-4" />
          Ajouter au panier
        </AddToCartButton>
      </div>
    </article>
  );
}
