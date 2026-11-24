import { describe, expect, it } from "vitest";
import {
  addLine,
  defaultVariant,
  freeShippingRemainingUsd,
  itemCount,
  lineKey,
  setQuantity,
  totals,
} from "./cart";
import { products } from "./data/products.data";
import type { CartLine } from "./types";

const line = (over: Partial<CartLine> = {}): CartLine => ({
  slug: "the-ledger",
  colour: "brown",
  colourLabel: "Saddle Brown",
  name: "The Ledger",
  unitPrice: 48,
  image: "x",
  maxStock: 3,
  quantity: 1,
  ...over,
});

describe("addLine", () => {
  it("adds a new line", () => {
    expect(addLine([], line())).toHaveLength(1);
  });

  it("merges the same product and colour", () => {
    const lines = addLine(addLine([], line()), line({ quantity: 1 }));
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });

  it("keeps different colours as separate lines", () => {
    expect(addLine(addLine([], line()), line({ colour: "black" }))).toHaveLength(2);
  });

  it("caps quantity at stock", () => {
    const lines = addLine(addLine([], line({ quantity: 2 })), line({ quantity: 5 }));
    expect(lines[0].quantity).toBe(3);
  });

  it("ignores sold-out variants", () => {
    expect(addLine([], line({ maxStock: 0 }))).toEqual([]);
  });
});

describe("setQuantity", () => {
  const lines = [line({ quantity: 2 })];
  const key = lineKey(lines[0]);

  it("updates quantity within stock", () => {
    expect(setQuantity(lines, key, 3)[0].quantity).toBe(3);
  });

  it("caps at stock", () => {
    expect(setQuantity(lines, key, 99)[0].quantity).toBe(3);
  });

  it("removes the line at zero", () => {
    expect(setQuantity(lines, key, 0)).toEqual([]);
  });
});

describe("totals", () => {
  // 2 × $48 + 1 × $18 = $114 — just under the $120 free-shipping threshold.
  const lines = [line({ quantity: 2 }), line({ slug: "the-loop", unitPrice: 18 })];

  it("counts items", () => {
    expect(itemCount(lines)).toBe(3);
  });

  it("adds zone shipping in USD", () => {
    expect(totals(lines, "europe", "USD")).toEqual({
      subtotal: 114,
      shipping: 16,
      total: 130,
      freeShipping: false,
    });
  });

  it("converts each unit price so totals add up in other currencies", () => {
    // EUR 0.92: 48→44, 18→17, shipping 16→15
    expect(totals(lines, "europe", "EUR")).toEqual({
      subtotal: 44 * 2 + 17,
      shipping: 15,
      total: 44 * 2 + 17 + 15,
      freeShipping: false,
    });
  });

  it("ships free at or above the threshold", () => {
    const big = [line({ quantity: 3 })]; // $144
    expect(freeShippingRemainingUsd(big)).toBe(0);
    expect(totals(big, "north-america", "USD").shipping).toBe(0);
  });

  it("reports how far from free shipping", () => {
    expect(freeShippingRemainingUsd(lines)).toBe(6);
  });

  it("charges nothing on an empty bag", () => {
    expect(totals([], "rest", "USD")).toEqual({
      subtotal: 0,
      shipping: 0,
      total: 0,
      freeShipping: false,
    });
  });
});

describe("defaultVariant", () => {
  it("prefers the colour shown in the photo", () => {
    const fold = products.find((p) => p.slug === "the-fold")!;
    expect(defaultVariant(fold).colour).toBe("black");
  });
});
