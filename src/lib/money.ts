import { currencies } from "./config";
import type { CurrencyCode } from "./types";

/**
 * Convert a USD amount to a display currency, rounded to whole units.
 * Unit prices are converted individually and then summed, so the numbers a
 * customer sees always add up.
 */
export function convert(usd: number, currency: CurrencyCode): number {
  return Math.round(usd * currencies[currency].rate);
}

const formatters = new Map<CurrencyCode, Intl.NumberFormat>();

/** Format an amount that is already in `currency`. */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === "BDT") {
    return `৳${new Intl.NumberFormat("en-US").format(amount)}`;
  }
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat(currencies[currency].locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
    formatters.set(currency, f);
  }
  const s = f.format(amount);
  // Disambiguate dollars that would otherwise all read as "$".
  if (currency === "AUD") return `A${s}`;
  if (currency === "CAD") return `C${s}`;
  return s;
}

/** Convert from USD and format. */
export function formatUsdAs(usd: number, currency: CurrencyCode): string {
  return formatMoney(convert(usd, currency), currency);
}
