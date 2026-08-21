"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Cadence du défilement automatique. Assez lente pour qu'une carte reste
 * lisible avant d'être remplacée.
 */
const AUTOPLAY_INTERVAL_MS = 5000;

type Direction = "previous" | "next";

/**
 * Défilement d'un carrousel carte par carte, avec avance automatique.
 *
 * L'avance automatique se met en pause dès que l'utilisateur survole, touche
 * ou navigue au clavier dans le carrousel, et ne tourne pas quand l'onglet est
 * en arrière-plan ni quand le système demande à réduire les animations.
 */
export function useCarouselAutoplay() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  const scrollToCard = useCallback(
    (direction: Direction, { instantRewind = false } = {}) => {
      const scroller = scrollRef.current;

      if (!scroller) {
        return;
      }

      const cards = Array.from(
        scroller.querySelectorAll<HTMLElement>("[data-carousel-card]"),
      );
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

      if (!cards.length || maxScrollLeft <= 0) {
        return;
      }

      const currentLeft = scroller.scrollLeft;
      // Revenir au début en animant toute la largeur donne un balayage brutal.
      // En automatique on repositionne donc sans animation ; sur un clic de
      // l'utilisateur on garde le mouvement, qui reste attendu.
      const rewindBehavior: ScrollBehavior = instantRewind ? "instant" : "smooth";

      if (direction === "next" && currentLeft >= maxScrollLeft - 4) {
        scroller.scrollTo({ left: 0, behavior: rewindBehavior });
        return;
      }

      if (direction === "previous" && currentLeft <= 4) {
        scroller.scrollTo({ left: maxScrollLeft, behavior: rewindBehavior });
        return;
      }

      const currentIndex = cards.reduce(
        (closestIndex, card, index) =>
          Math.abs(card.offsetLeft - currentLeft) <
          Math.abs(cards[closestIndex].offsetLeft - currentLeft)
            ? index
            : closestIndex,
        0,
      );

      const nextIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, cards.length - 1)
          : Math.max(currentIndex - 1, 0);

      scroller.scrollTo({
        left: Math.min(cards[nextIndex].offsetLeft, maxScrollLeft),
        behavior: "smooth",
      });
    },
    [],
  );

  useEffect(() => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const pause = () => {
      isPausedRef.current = true;
    };
    const resume = () => {
      isPausedRef.current = false;
    };

    scroller.addEventListener("pointerenter", pause);
    scroller.addEventListener("pointerleave", resume);
    scroller.addEventListener("pointerdown", pause);
    scroller.addEventListener("focusin", pause);
    scroller.addEventListener("focusout", resume);
    scroller.addEventListener("touchstart", pause, { passive: true });
    scroller.addEventListener("touchend", resume, { passive: true });

    const intervalId = window.setInterval(() => {
      if (isPausedRef.current || document.hidden) {
        return;
      }

      scrollToCard("next", { instantRewind: true });
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      scroller.removeEventListener("pointerenter", pause);
      scroller.removeEventListener("pointerleave", resume);
      scroller.removeEventListener("pointerdown", pause);
      scroller.removeEventListener("focusin", pause);
      scroller.removeEventListener("focusout", resume);
      scroller.removeEventListener("touchstart", pause);
      scroller.removeEventListener("touchend", resume);
    };
  }, [scrollToCard]);

  return { scrollRef, scrollToCard };
}
