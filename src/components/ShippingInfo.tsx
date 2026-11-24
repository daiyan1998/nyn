"use client";

import {
  countries,
  findCountry,
  shippingZones,
  shopConfig,
  zoneForCountry,
} from "@/lib/config";
import { formatUsdAs } from "@/lib/money";
import { useCountry, useCurrency, useShop } from "@/store/shop";

/** Country picker that also sets the shipping destination everywhere. */
export function CountrySelect({ id, className = "" }: { id: string; className?: string }) {
  const country = useCountry();
  const setCountry = useShop((s) => s.setCountry);
  return (
    <select
      id={id}
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      className={className}
    >
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

/** "Ships to <country> in N days · $X (free over $120)", for product and bag. */
export function ShippingEstimate({ compact = false }: { compact?: boolean }) {
  const currency = useCurrency();
  const country = useCountry();
  const zone = shippingZones[zoneForCountry(country)];
  const name = findCountry(country)?.name ?? country;
  const free = formatUsdAs(shopConfig.freeShippingOverUsd, currency);

  return (
    <div className={`flex flex-col gap-1 ${compact ? "text-[13px]" : "text-[14px]"}`}>
      <p className="leading-relaxed text-bone">
        Ships to{" "}
        <label className="relative inline-flex cursor-none items-center border-b border-dashed border-bone-dim">
          <span className="sr-only">Shipping country</span>
          <span aria-hidden="true">{name} ▾</span>
          <CountrySelect
            id={compact ? "ship-country-compact" : "ship-country"}
            className="absolute inset-0 w-full opacity-0"
          />
        </label>{" "}
        in {zone.days}.
      </p>
      <p className="leading-relaxed text-bone-dim">
        {formatUsdAs(zone.rateUsd, currency)} tracked shipping · free over {free}
      </p>
    </div>
  );
}
