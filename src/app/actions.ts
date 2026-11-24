"use server";

import { catalog } from "@/lib/data";
import { totals } from "@/lib/cart";
import {
  paymentMethodsFor,
  shippingZones,
  shopConfig,
  zoneForCountry,
} from "@/lib/config";
import {
  checkoutSchema,
  newsletterSchema,
  type CheckoutInput,
  type CustomerField,
  type CustomerFieldErrors,
} from "@/lib/checkout-schema";
import { convert } from "@/lib/money";
import type { Order, OrderLine } from "@/lib/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; formError?: string; fieldErrors?: CustomerFieldErrors };

function newOrderId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TN-${Date.now().toString(36).slice(-4).toUpperCase()}${rand}`;
}

/**
 * Mock checkout. Validates input, re-prices every line from the catalogue,
 * checks stock, "takes payment" and returns a fake order. Nothing is
 * persisted server-side — the client keeps the returned order in localStorage.
 */
export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  await sleep(shopConfig.simulatedLatencyMs);

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: CustomerFieldErrors = {};
    let formError: string | undefined;
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "customer") {
        fieldErrors[issue.path[1] as CustomerField] ??= issue.message;
      } else {
        formError ??= issue.message;
      }
    }
    return { ok: false, fieldErrors, formError };
  }

  const { customer, lines, currency, payment } = parsed.data;

  if (!paymentMethodsFor(customer.country).includes(payment)) {
    return {
      ok: false,
      formError: "Cash on delivery is only available for addresses in Bangladesh.",
    };
  }

  const priced: (OrderLine & { unitPriceUsd: number })[] = [];
  for (const line of lines) {
    const product = await catalog.get(line.slug);
    const variant = product?.variants.find((v) => v.colour === line.colour);
    if (!product || !variant) {
      return { ok: false, formError: "An item in your bag is no longer available." };
    }
    if (variant.stock < line.quantity) {
      return {
        ok: false,
        formError:
          variant.stock === 0
            ? `${product.name} in ${variant.label} just sold out. Remove it from your bag to continue.`
            : `Only ${variant.stock} of ${product.name} in ${variant.label} left — please lower the quantity.`,
      };
    }
    priced.push({
      slug: product.slug,
      name: product.name,
      colour: variant.colour,
      colourLabel: variant.label,
      unitPriceUsd: product.price,
      unitPrice: convert(product.price, currency),
      quantity: line.quantity,
      image: product.images[0].src,
    });
  }

  // Simulated payment authorisation (card / PayPal).
  if (payment !== "cod") await sleep(shopConfig.simulatedPaymentMs);

  const zone = zoneForCountry(customer.country);
  const sums = totals(
    priced.map((l) => ({ unitPrice: l.unitPriceUsd, quantity: l.quantity })),
    zone,
    currency,
  );

  const order: Order = {
    id: newOrderId(),
    placedAt: new Date().toISOString(),
    currency,
    customer,
    zone,
    deliveryEstimate: shippingZones[zone].days,
    lines: priced.map((l) => ({
      slug: l.slug,
      name: l.name,
      colour: l.colour,
      colourLabel: l.colourLabel,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
      image: l.image,
    })),
    subtotal: sums.subtotal,
    shipping: sums.shipping,
    total: sums.total,
    payment,
  };

  return { ok: true, order };
}

export type SubscribeResult = { ok: true } | { ok: false; error: string };

/** Mock newsletter signup: validates and pretends to subscribe. */
export async function subscribe(email: string): Promise<SubscribeResult> {
  await sleep(shopConfig.simulatedLatencyMs);
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true };
}
