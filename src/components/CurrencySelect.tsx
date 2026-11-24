"use client";

import { currencies, currencyCodes } from "@/lib/config";
import type { CurrencyCode } from "@/lib/types";
import { useCurrency, useShop } from "@/store/shop";

export function CurrencySelect({ className = "" }: { className?: string }) {
  const currency = useCurrency();
  const setCurrency = useShop((s) => s.setCurrency);
  return (
    <label className={`currency-select ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      >
        {currencyCodes.map((c) => (
          <option key={c} value={c}>
            {c} — {currencies[c].label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="currency-select-value">
        {currency} ▾
      </span>
    </label>
  );
}
