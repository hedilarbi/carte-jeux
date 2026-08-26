"use client";

import { useCurrency } from "@/components/site/providers/currency-provider";
import { formatPriceWithCurrency } from "@/lib/utils/currency";

export function ProductPrice({ 
  amount, 
  className = "" 
}: { 
  amount: number;
  className?: string;
}) {
  const { currency, isLoading } = useCurrency();

  if (isLoading) {
    return <span className={`opacity-50 ${className}`}>Calcul...</span>;
  }

  return (
    <span className={className}>
      {formatPriceWithCurrency(amount, currency)}
    </span>
  );
}
