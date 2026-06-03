"use client";

import { useCallback, useEffect, useState } from "react";

type CartPayload = {
  items?: Array<{ quantity: number }>;
};

type FavoritePayload = {
  items?: unknown[];
};

function countCartItems(cart: CartPayload | null) {
  return (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

function countFavoriteItems(favorites: FavoritePayload | null) {
  return favorites?.items?.length ?? 0;
}

export function useHeaderCounters() {
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const refreshCounters = useCallback(async () => {
    try {
      const [cartResponse, favoritesResponse] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/favorites"),
      ]);
      const [cartPayload, favoritesPayload] = await Promise.all([
        cartResponse.json(),
        favoritesResponse.json(),
      ]);

      if (cartPayload?.success) {
        setCartCount(countCartItems(cartPayload.data));
      }

      if (favoritesPayload?.success) {
        setFavoriteCount(countFavoriteItems(favoritesPayload.data));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refreshCounters();
    });

    function handleCartUpdate(event: Event) {
      const customEvent = event as CustomEvent<CartPayload>;
      setCartCount(countCartItems(customEvent.detail));
    }

    function handleFavoritesUpdate(event: Event) {
      const customEvent = event as CustomEvent<FavoritePayload>;
      setFavoriteCount(countFavoriteItems(customEvent.detail));
    }

    window.addEventListener("cart:updated", handleCartUpdate);
    window.addEventListener("favorites:updated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate);
      window.removeEventListener("favorites:updated", handleFavoritesUpdate);
    };
  }, [refreshCounters]);

  return {
    cartCount,
    favoriteCount,
  };
}
