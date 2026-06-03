"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type FavoriteItemPayload = {
  productId: string;
  productSlug: string;
};

type FavoriteListPayload = {
  items?: FavoriteItemPayload[];
};

let favoriteRefs = new Set<string>();
let favoriteListPromise: Promise<FavoriteListPayload | null> | null = null;

function collectRefs(payload: FavoriteListPayload | null) {
  favoriteRefs = new Set(
    (payload?.items ?? []).flatMap((item) => [
      item.productId,
      item.productSlug,
    ]),
  );
}

async function loadFavoriteList() {
  if (!favoriteListPromise) {
    favoriteListPromise = fetch("/api/favorites")
      .then((response) => response.json())
      .then((payload) => {
        const data = payload?.success ? payload.data : null;
        collectRefs(data);
        return data as FavoriteListPayload | null;
      })
      .catch((error) => {
        console.error(error);
        favoriteListPromise = null;
        return null;
      });
  }

  return favoriteListPromise;
}

function hasFavorite(productId?: string, productSlug?: string) {
  return Boolean(
    (productId && favoriteRefs.has(productId)) ||
      (productSlug && favoriteRefs.has(productSlug)),
  );
}

interface FavoriteButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  activeClassName?: string;
  children?: ReactNode | ((state: { isFavorite: boolean }) => ReactNode);
  iconClassName?: string;
  productId?: string;
  productSlug?: string;
  refreshOnChange?: boolean;
}

export function FavoriteButton({
  activeClassName,
  children,
  className,
  disabled,
  iconClassName,
  productId,
  productSlug,
  refreshOnChange = false,
  ...props
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canSubmit = Boolean(productId || productSlug);
  const productReference = productSlug ?? productId;
  const renderedChildren =
    typeof children === "function" ? children({ isFavorite }) : children;

  useEffect(() => {
    let isMounted = true;

    loadFavoriteList().then(() => {
      if (isMounted) {
        setIsFavorite(hasFavorite(productId, productSlug));
      }
    });

    function handleFavoritesUpdate(event: Event) {
      const customEvent = event as CustomEvent<FavoriteListPayload>;
      collectRefs(customEvent.detail);
      setIsFavorite(hasFavorite(productId, productSlug));
    }

    window.addEventListener("favorites:updated", handleFavoritesUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("favorites:updated", handleFavoritesUpdate);
    };
  }, [productId, productSlug]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    if (!canSubmit || !productReference) {
      setHasError(true);
      return;
    }

    setIsPending(true);
    setHasError(false);

    try {
      const response = await fetch(
        isFavorite
          ? `/api/favorites/items/${encodeURIComponent(productReference)}`
          : "/api/favorites/items",
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: isFavorite
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          body: isFavorite
            ? undefined
            : JSON.stringify({
                ...(productId ? { productId } : {}),
                ...(productSlug ? { slug: productSlug } : {}),
              }),
        },
      );
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Impossible de mettre à jour les favoris.",
        );
      }

      favoriteListPromise = Promise.resolve(payload.data);
      collectRefs(payload.data);
      setIsFavorite(hasFavorite(productId, productSlug));
      window.dispatchEvent(
        new CustomEvent("favorites:updated", {
          detail: payload.data,
        }),
      );

      if (refreshOnChange) {
        router.refresh();
      }
    } catch (error) {
      setHasError(true);
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      aria-busy={isPending}
      aria-disabled={!canSubmit || disabled || isPending}
      aria-pressed={isFavorite}
      className={cn(
        className,
        isFavorite && activeClassName,
        hasError && "ring-2 ring-danger/70",
      )}
      disabled={disabled || isPending}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {renderedChildren ?? (
        <Heart
          className={cn(iconClassName ?? "size-4", isFavorite && "fill-current")}
        />
      )}
    </button>
  );
}
