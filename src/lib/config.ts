import type { CurrencyCode, PaymentMethod, ShippingZoneId } from "./types";

/**
 * Shop-wide settings. Change values here, not in components.
 *
 * Values marked PLACEHOLDER are demo defaults that the shop owner has not
 * confirmed yet (prices, rates, policies). Confirm before going live.
 */
export const shopConfig = {
  name: "Tennor & Co.",
  email: "nayanbashar@gmail.com",
  phone: "+8801981799335",
  phoneDisplay: "+880 1981-799335",
  /** wa.me number: digits only, with country code. */
  whatsapp: "8801981799335",
  city: "Dhaka, Bangladesh",
  /** Fill in real profile URLs; empty ones are hidden. */
  social: { Instagram: "", Facebook: "" } as Record<string, string>,
  /** PLACEHOLDER: free worldwide shipping above this subtotal (USD). */
  freeShippingOverUsd: 120,
  /** PLACEHOLDER policy lines shown at product, bag and checkout. */
  policies: {
    returns: "30-day returns",
    returnsDetail: "Unused pieces can be returned within 30 days of delivery.",
    tracked: "Tracked delivery worldwide",
    duties:
      "Import duties or taxes, if your country charges them, are collected by the courier on delivery.",
  },
  /** Artificial delay for mock async actions, so loading states are visible. */
  simulatedLatencyMs: 600,
  /** Extra delay for the simulated payment step. */
  simulatedPaymentMs: 900,
  /** Minutes after placing an order at which the mock status advances. */
  orderStatusMinutes: { confirmed: 1, shipped: 5 },
} as const;

/* ---------------- currencies ---------------- */

/** PLACEHOLDER mock exchange rates: 1 USD = rate units. */
export const currencies: Record<
  CurrencyCode,
  { rate: number; label: string; locale: string }
> = {
  USD: { rate: 1, label: "US Dollar", locale: "en-US" },
  EUR: { rate: 0.92, label: "Euro", locale: "en-IE" },
  GBP: { rate: 0.79, label: "British Pound", locale: "en-GB" },
  AUD: { rate: 1.52, label: "Australian Dollar", locale: "en-AU" },
  CAD: { rate: 1.37, label: "Canadian Dollar", locale: "en-CA" },
  BDT: { rate: 120, label: "Bangladeshi Taka", locale: "en-US" },
};

export const currencyCodes = Object.keys(currencies) as [
  CurrencyCode,
  ...CurrencyCode[],
];

/* ---------------- shipping ---------------- */

/** PLACEHOLDER rates (USD) and delivery estimates per zone. */
export const shippingZones: Record<
  ShippingZoneId,
  { label: string; rateUsd: number; days: string }
> = {
  bd: { label: "Bangladesh", rateUsd: 2, days: "2–4 business days" },
  "south-asia": { label: "South Asia", rateUsd: 10, days: "5–8 business days" },
  asia: { label: "Asia, Middle East & Oceania", rateUsd: 14, days: "6–10 business days" },
  europe: { label: "Europe & UK", rateUsd: 16, days: "7–12 business days" },
  "north-america": { label: "North America", rateUsd: 18, days: "8–14 business days" },
  rest: { label: "Rest of world", rateUsd: 22, days: "10–18 business days" },
};

const euro = "EUR" as const;

/** Countries we ship to: zone, and the currency we suggest to visitors there. */
const countryTable: [code: string, zone: ShippingZoneId, currency?: CurrencyCode][] = [
  ["BD", "bd", "BDT"],
  ["IN", "south-asia"], ["PK", "south-asia"], ["NP", "south-asia"],
  ["LK", "south-asia"], ["BT", "south-asia"], ["MV", "south-asia"],
  ["CN", "asia"], ["HK", "asia"], ["JP", "asia"], ["KR", "asia"], ["TW", "asia"],
  ["SG", "asia"], ["MY", "asia"], ["TH", "asia"], ["ID", "asia"], ["PH", "asia"],
  ["VN", "asia"], ["AE", "asia"], ["SA", "asia"], ["QA", "asia"], ["KW", "asia"],
  ["OM", "asia"], ["BH", "asia"], ["AU", "asia", "AUD"], ["NZ", "asia"],
  ["GB", "europe", "GBP"], ["IE", "europe", euro], ["FR", "europe", euro],
  ["DE", "europe", euro], ["NL", "europe", euro], ["BE", "europe", euro],
  ["LU", "europe", euro], ["ES", "europe", euro], ["PT", "europe", euro],
  ["IT", "europe", euro], ["AT", "europe", euro], ["FI", "europe", euro],
  ["GR", "europe", euro], ["CH", "europe"], ["SE", "europe"], ["NO", "europe"],
  ["DK", "europe"], ["PL", "europe"], ["CZ", "europe"], ["HU", "europe"],
  ["RO", "europe"],
  ["US", "north-america", "USD"], ["CA", "north-america", "CAD"], ["MX", "north-america"],
  ["BR", "rest"], ["AR", "rest"], ["CL", "rest"], ["CO", "rest"], ["ZA", "rest"],
  ["NG", "rest"], ["KE", "rest"], ["EG", "rest"], ["MA", "rest"], ["TR", "rest"],
];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const countries = countryTable
  .map(([code, zone, currency]) => ({
    code,
    zone,
    currency: currency ?? ("USD" as CurrencyCode),
    name: regionNames.of(code) ?? code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const countryCodes = countries.map((c) => c.code) as [string, ...string[]];

export const DEFAULT_COUNTRY = "US";

export function findCountry(code: string | null | undefined) {
  return countries.find((c) => c.code === code);
}

export function zoneForCountry(code: string): ShippingZoneId {
  return findCountry(code)?.zone ?? "rest";
}

/** Payment methods offered for a destination. COD only within Bangladesh. */
export function paymentMethodsFor(country: string): PaymentMethod[] {
  return country === "BD" ? ["card", "paypal", "cod"] : ["card", "paypal"];
}

export const paymentLabels: Record<PaymentMethod, { title: string; detail: string }> = {
  card: { title: "Credit or debit card", detail: "Visa, Mastercard, Amex — processed securely." },
  paypal: { title: "PayPal", detail: "You'll confirm with your PayPal account." },
  cod: { title: "Cash on delivery", detail: "Bangladesh only. Pay the courier on arrival." },
};

/** Best-guess country from the browser's language settings (e.g. en-GB → GB). */
export function detectCountry(languages: readonly string[]): string {
  for (const tag of languages) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region && findCountry(region)) return region;
    } catch {
      // ignore malformed tags
    }
  }
  return DEFAULT_COUNTRY;
}
