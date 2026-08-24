"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const gclid = searchParams.get("gclid");
    if (gclid) {
      // Set cookie for 30 days
      const d = new Date();
      d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
      document.cookie = `playsdepot_gclid=${gclid};expires=${d.toUTCString()};path=/`;
    }
  }, [searchParams]);

  return null;
}

export function GclidTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
