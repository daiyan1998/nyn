"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { defaultVariant, toCartLine } from "@/lib/cart";
import { formatUsdAs } from "@/lib/money";
import type { ColourId, Product } from "@/lib/types";
import { useCurrency, useShop } from "@/store/shop";
import { ColourSwatches } from "./ColourSwatches";
import { QtyStepper } from "./QtyStepper";

export function ProductPurchase({ product }: { product: Product }) {
  const lines = useShop((s) => s.lines);
  const add = useShop((s) => s.add);
  const openDrawer = useShop((s) => s.openDrawer);
  const currency = useCurrency();

  const [colour, setColour] = useState<ColourId>(defaultVariant(product).colour);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  // True only on the client after the store loads, so the portal never runs on the server.
  const mounted = useShop((s) => s.hydrated);

  const variant = product.variants.find((v) => v.colour === colour)!;
  const inBag =
    lines.find((l) => l.slug === product.slug && l.colour === colour)?.quantity ?? 0;
  const available = Math.max(variant.stock - inBag, 0);
  const quantity = Math.min(qty, Math.max(available, 1));
  const photoLabel = product.variants.find((v) => v.colour === product.photoColour)?.label;

  // Show a sticky buy bar on small screens once the main button scrolls away.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Let other fixed UI (the contact button) make room for the bar.
  const setStickyBar = useShop((s) => s.setStickyBar);
  useEffect(() => {
    setStickyBar(showSticky);
    return () => setStickyBar(false);
  }, [showSticky, setStickyBar]);

  const stockText =
    variant.stock === 0
      ? "Sold out in this colour — choose another, or ask us about the next batch"
      : available === 0
        ? "You have all remaining stock in your bag"
        : variant.stock <= 3
          ? `Only ${variant.stock} left in this batch`
          : "In stock · made and packed in Dhaka";

  const label =
    variant.stock === 0
      ? "Sold out"
      : available === 0
        ? "All in your bag"
        : busy
          ? "Adding…"
          : `Add to bag — ${formatUsdAs(product.price * quantity, currency)}`;

  const onAdd = () => {
    if (!available || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      add(toCartLine(product, variant, quantity));
      setQty(1);
      setBusy(false);
      openDrawer("bag");
    }, 250);
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase">
          Colour — <span className="text-bone">{variant.label}</span>
        </p>
        <ColourSwatches
          name={`pdp-${product.slug}`}
          variants={product.variants}
          value={colour}
          onChange={(c) => {
            setColour(c);
            setQty(1);
          }}
        />
        <p
          className={`text-[13px] ${variant.stock === 0 || available === 0 ? "text-tan" : "text-bone-dim"}`}
        >
          {stockText}
        </p>
        {photoLabel && product.photoColour !== colour && (
          <p className="text-[12.5px] text-bone-dim/80">
            Photos show {photoLabel}. Each hide varies slightly in tone.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <QtyStepper
          value={quantity}
          max={Math.max(available, 1)}
          label={product.name}
          onChange={(q) => setQty(Math.max(1, q))}
        />
        <button
          ref={buttonRef}
          type="button"
          className="btn mt-0! grow sm:grow-0"
          onClick={onAdd}
          disabled={available === 0}
          aria-busy={busy}
        >
          <span>{label}</span>
        </button>
      </div>

      {/* Mobile sticky buy bar — portalled to <body>, because the reveal
          wrapper's transform would otherwise trap position: fixed. */}
      {mounted && createPortal(<div
        aria-hidden={!showSticky}
        inert={!showSticky}
        className={`fixed inset-x-0 bottom-0 z-[120] flex items-center gap-4 border-t border-line bg-ink-2/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-serif text-lg leading-tight">{product.name}</span>
          <span className="font-mono text-[10.5px] tracking-[.08em] text-bone-dim uppercase">
            {variant.label}
          </span>
        </div>
        <button
          type="button"
          className="btn mt-0! px-5!"
          onClick={onAdd}
          disabled={available === 0}
        >
          <span>{available === 0 ? "Sold out" : busy ? "Adding…" : "Add to bag"}</span>
        </button>
      </div>, document.body)}
    </div>
  );
}
