"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { type Currency } from "@/lib/utils/currency";

/** Devise choisie explicitement par le visiteur : elle prime et n'expire pas. */
const PREFERENCE_KEY = "playsdepot_currency_preference";
/** Résultat de la détection par IP, réévalué passé le délai ci-dessous. */
const DETECTION_KEY = "playsdepot_currency_detection";
/** Ancienne clé unique, qui confondait choix explicite et détection. */
const LEGACY_KEY = "user_currency";

const DETECTION_TTL_MS = 24 * 60 * 60 * 1000;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "TND",
  setCurrency: () => {},
  isLoading: true,
});

function isCurrency(value: unknown): value is Currency {
  return value === "TND" || value === "EUR";
}

/** Toute lecture peut échouer : navigation privée, stockage bloqué. */
function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Le stockage est indisponible : la détection se refera au prochain chargement.
  }
}

function readFreshDetection(): Currency | null {
  const raw = readStorage(DETECTION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { currency?: unknown; detectedAt?: unknown };

    if (!isCurrency(parsed.currency) || typeof parsed.detectedAt !== "number") {
      return null;
    }

    return Date.now() - parsed.detectedAt < DETECTION_TTL_MS
      ? parsed.currency
      : null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("TND");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function resolveCurrency(): Promise<Currency> {
      // L'ancienne clé ne disait pas si la valeur venait d'un choix ou d'une
      // détection. On la retire pour repartir sur une détection propre.
      if (readStorage(LEGACY_KEY)) {
        try {
          window.localStorage.removeItem(LEGACY_KEY);
        } catch {
          // Sans importance : la clé n'est plus lue nulle part.
        }
      }

      const preference = readStorage(PREFERENCE_KEY);

      if (isCurrency(preference)) {
        return preference;
      }

      const detected = readFreshDetection();

      if (detected) {
        return detected;
      }

      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        const data = (await response.json()) as { country_code?: string };
        const detectedCurrency: Currency =
          data.country_code === "TN" ? "TND" : "EUR";

        writeStorage(
          DETECTION_KEY,
          JSON.stringify({
            currency: detectedCurrency,
            detectedAt: Date.now(),
          }),
        );

        return detectedCurrency;
      } catch {
        // Détection indisponible : on ne mémorise rien, pour retenter au
        // prochain chargement plutôt que de figer le dinar pour 24 heures.
        return "TND";
      }
    }

    resolveCurrency().then((resolved) => {
      if (cancelled) {
        return;
      }

      setCurrencyState(resolved);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    writeStorage(PREFERENCE_KEY, newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
