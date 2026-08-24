"use client";

import { useEffect, useRef } from "react";

interface PurchaseTrackerProps {
  orderNumber: string;
  value: number;
  currency: string;
}

export function PurchaseTracker({
  orderNumber,
  value,
  currency,
}: PurchaseTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "purchase",
        value: value,
        currency: currency,
        transaction_id: orderNumber,
      });
    }
  }, [orderNumber, value, currency]);

  return null;
}
