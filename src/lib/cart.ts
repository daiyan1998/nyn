import { shippingZones, shopConfig } from "./config";
import { convert } from "./money";
import type {
  CartLine,
  CurrencyCode,
  Product,
  ShippingZoneId,
  Variant,
} from "./types";

export function toCartLine(product: Product, variant: Variant, quantity = 1): CartLine {
  return {
    slug: product.slug,
    colour: variant.colour,
    colourLabel: variant.label,
    name: product.name,
    unitPrice: product.price,
    image: product.images[0].src,
    maxStock: variant.stock,
    quantity,
  };
}

/** Default colour: the one in the photo if in stock, else the first in stock. */
export function defaultVariant(product: Product): Variant {
  const inStock = product.variants.filter((v) => v.stock > 0);
  return (
    inStock.find((v) => v.colour === product.photoColour) ??
    inStock[0] ??
    product.variants[0]
  );
}

export const lineKey =(l: Pick<CartLine, "slug" | "colour">) =>
  `${l.slug}:${l.colour}`;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

/** Add a line, merging with an existing slug+colour and capping at stock. */
export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  if (incoming.maxStock <= 0) return lines;
  const key = lineKey(incoming);
  const existing = lines.find((l) => lineKey(l) === key);
  if (!existing) {
    return [
      ...lines,
      { ...incoming, quantity: clamp(incoming.quantity, 1, incoming.maxStock) },
    ];
  }
  return lines.map((l) =>
    lineKey(l) === key
      ? { ...l, quantity: clamp(l.quantity + incoming.quantity, 1, l.maxStock) }
      : l,
  );
}

/** Set a line's quantity. 0 or less removes it; values above stock are capped. */
export function setQuantity(
  lines: CartLine[],
  key: string,
  quantity: number,
): CartLine[] {
  if (quantity <= 0) return lines.filter((l) => lineKey(l) !== key);
  return lines.map((l) =>
    lineKey(l) === key ? { ...l, quantity: clamp(quantity, 1, l.maxStock) } : l,
  );
}

export const itemCount = (lines: { quantity: number }[]) =>
  lines.reduce((n, l) => n + l.quantity, 0);

export const subtotalUsd = (lines: { unitPrice: number; quantity: number }[]) =>
  lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

/** How much more (USD) unlocks free shipping; 0 once reached. */
export const freeShippingRemainingUsd = (
  lines: { unitPrice: number; quantity: number }[],
) => Math.max(shopConfig.freeShippingOverUsd - subtotalUsd(lines), 0);

/**
 * Totals in the display currency. `lines` carry USD unit prices; each unit
 * price is converted first so line items, subtotal and total add up exactly.
 */
export function totals(
  lines: { unitPrice: number; quantity: number }[],
  zone: ShippingZoneId,
  currency: CurrencyCode,
) {
  const subtotal = lines.reduce(
    (sum, l) => sum + convert(l.unitPrice, currency) * l.quantity,
    0,
  );
  const freeShipping = lines.length > 0 && freeShippingRemainingUsd(lines) === 0;
  const shipping =
    lines.length === 0 || freeShipping
      ? 0
      : convert(shippingZones[zone].rateUsd, currency);
  return { subtotal, shipping, total: subtotal + shipping, freeShipping };
}
