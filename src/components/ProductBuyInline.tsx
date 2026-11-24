"use client";

import Link from "next/link";
import { useState } from "react";
import { defaultVariant, toCartLine } from "@/lib/cart";
import type { ColourId, Product } from "@/lib/types";
import { useShop } from "@/store/shop";
import { ColourSwatches } from "./ColourSwatches";

/**
 * Home-page buy controls: the customer picks a colour, then adds it.
 * Nothing is added in a colour they didn't see selected.
 */
export function ProductBuyInline({ product }: { product: Product }) {
  const add = useShop((s) => s.add);
  const openDrawer = useShop((s) => s.openDrawer);
  const lines = useShop((s) => s.lines);
  const [colour, setColour] = useState<ColourId>(defaultVariant(product).colour);
  const [busy, setBusy] = useState(false);

  const variant = product.variants.find((v) => v.colour === colour)!;
  const inBag =
    lines.find((l) => l.slug === product.slug && l.colour === colour)?.quantity ?? 0;
  const available = variant.stock - inBag;

  const onAdd = () => {
    if (available <= 0 || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      add(toCartLine(product, variant));
      openDrawer("bag");
      setBusy(false);
    }, 250);
  };

  const status =
    variant.stock === 0
      ? "Sold out in this colour"
      : variant.stock <= 3
        ? `Only ${variant.stock} left`
        : "In stock";

  return (
    <div className="reveal flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <ColourSwatches
          name={`home-${product.slug}`}
          variants={product.variants}
          value={colour}
          onChange={setColour}
        />
        <span className="font-mono text-[11px] tracking-[.08em] text-bone-dim uppercase">
          {variant.label} · {status}
        </span>
      </div>
      <div className="btn-row mt-0!">
        <button
          type="button"
          className="btn"
          onClick={onAdd}
          disabled={available <= 0}
          aria-busy={busy}
          aria-label={`Add ${product.name} in ${variant.label} to bag`}
        >
          <span>
            {variant.stock === 0
              ? "Sold out"
              : available <= 0
                ? "All in your bag"
                : busy
                  ? "Adding…"
                  : "Add to bag"}
          </span>
        </button>
        <Link href={`/products/${product.slug}`} className="text-link">
          Details →
        </Link>
      </div>
    </div>
  );
}
