"use client";

import { formatUsdAs } from "@/lib/money";
import { useCurrency } from "@/store/shop";

/**
 * A USD price shown in the visitor's currency. Renders USD on the server and
 * switches after the visitor's currency is loaded.
 */
export function Price({ usd, className }: { usd: number; className?: string }) {
  const currency = useCurrency();
  return (
    <span className={className} suppressHydrationWarning>
      {formatUsdAs(usd, currency)}
    </span>
  );
}
