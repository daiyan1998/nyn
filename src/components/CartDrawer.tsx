"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  freeShippingRemainingUsd,
  itemCount,
  lineKey,
  totals,
} from "@/lib/cart";
import { shopConfig, zoneForCountry } from "@/lib/config";
import { formatMoney, formatUsdAs } from "@/lib/money";
import { stageAt, stageLabels } from "@/lib/order-status";
import { useCountry, useCurrency, useShop } from "@/store/shop";
import { QtyStepper } from "./QtyStepper";
import { ShippingEstimate } from "./ShippingInfo";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const open = useShop((s) => s.drawerOpen);
  const tab = useShop((s) => s.drawerTab);
  const close = useShop((s) => s.closeDrawer);
  const openDrawer = useShop((s) => s.openDrawer);
  const lines = useShop((s) => s.lines);
  const orders = useShop((s) => s.orders);
  const setQty = useShop((s) => s.setQty);
  const currency = useCurrency();
  const country = useCountry();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus management, Escape to close, focus trap, scroll lock.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  const count = itemCount(lines);
  const sums = totals(lines, zoneForCountry(country), currency);
  const remaining = freeShippingRemainingUsd(lines);
  const progress = Math.min(
    100,
    100 - (remaining / shopConfig.freeShippingOverUsd) * 100,
  );

  return (
    <div
      className={`fixed inset-0 z-[200] transition-[visibility] ${
        open ? "visible" : "pointer-events-none invisible delay-500"
      }`}
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/70 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={`absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col border-l border-line bg-ink-2 transition-transform duration-500 ease-leather ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-7 py-6">
          <div className="flex gap-6" role="tablist" aria-label="Bag sections">
            {(["bag", "orders"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => openDrawer(t)}
                className={`pb-1 font-mono text-[11px] tracking-[.14em] uppercase transition-colors ${
                  tab === t
                    ? "border-b border-brass-bright text-brass-bright"
                    : "text-bone-dim hover:text-bone"
                }`}
              >
                {t === "bag" ? `Bag (${count})` : `Orders (${orders.length})`}
              </button>
            ))}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase hover:text-bone"
          >
            Close ✕
          </button>
        </div>

        {tab === "bag" ? (
          lines.length === 0 ? (
            <EmptyState
              title="Your bag is empty."
              body="Everything is cut to order in small batches. Pick something you'll carry for years."
              onClose={close}
            />
          ) : (
            <>
              <div className="border-b border-line px-7 py-4">
                <p className="mb-2 text-[13px]">
                  {remaining > 0 ? (
                    <>
                      You&apos;re{" "}
                      <span className="text-brass-bright">
                        {formatUsdAs(remaining, currency)}
                      </span>{" "}
                      away from free shipping.
                    </>
                  ) : (
                    <span className="text-brass-bright">
                      You&apos;ve unlocked free worldwide shipping.
                    </span>
                  )}
                </p>
                <div
                  className="h-[3px] w-full bg-line"
                  role="progressbar"
                  aria-label="Progress to free shipping"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-brass-bright transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="flex-1 divide-y divide-line overflow-y-auto px-7">
                {lines.map((l) => {
                  const key = lineKey(l);
                  const atMax = l.quantity >= l.maxStock;
                  return (
                    <li key={key} className="flex gap-4 py-6">
                      <Link
                        href={`/products/${l.slug}`}
                        onClick={close}
                        className="relative h-[96px] w-[76px] shrink-0 overflow-hidden bg-panel"
                      >
                        <Image src={l.image} alt={l.name} fill sizes="76px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/products/${l.slug}`}
                            onClick={close}
                            className="font-serif text-xl leading-tight"
                          >
                            {l.name}
                          </Link>
                          <span className="price text-sm">
                            {formatUsdAs(l.unitPrice * l.quantity, currency)}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] tracking-[.08em] text-bone-dim uppercase">
                          {l.colourLabel}
                        </span>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <QtyStepper
                            value={l.quantity}
                            max={l.maxStock}
                            label={l.name}
                            onChange={(q) => setQty(key, q)}
                          />
                          <button type="button" onClick={() => setQty(key, 0)} className="text-link">
                            Remove
                          </button>
                        </div>
                        {atMax && (
                          <span className="text-xs text-tan">Only {l.maxStock} in stock.</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-4 border-t border-line px-7 py-6">
                <ShippingEstimate compact />
                <dl className="flex flex-col gap-2 border-t border-line pt-4 font-mono text-[12px] tracking-[.06em]">
                  <div className="flex justify-between">
                    <dt className="text-bone-dim">Subtotal</dt>
                    <dd>{formatMoney(sums.subtotal, currency)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-bone-dim">Shipping</dt>
                    <dd>{sums.freeShipping ? "Free" : formatMoney(sums.shipping, currency)}</dd>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <dt>Total</dt>
                    <dd className="text-brass-bright">{formatMoney(sums.total, currency)}</dd>
                  </div>
                </dl>
                <Link href="/checkout" onClick={close} className="btn w-full! self-stretch!">
                  <span>Secure checkout →</span>
                </Link>
                <button type="button" onClick={close} className="text-link self-center">
                  Keep shopping
                </button>
              </div>
            </>
          )
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet."
            body="Orders you place from this browser will appear here."
            onClose={close}
          />
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-7">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  onClick={close}
                  className="flex items-center justify-between gap-4 py-5"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[12px] tracking-[.1em] text-bone">{o.id}</span>
                    <span className="text-[13px] text-bone-dim">
                      {new Date(o.placedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {itemCount(o.lines)} items
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="price text-sm">{formatMoney(o.total, o.currency)}</span>
                    <span className="font-mono text-[10px] tracking-[.14em] text-brass-bright uppercase">
                      {stageLabels[stageAt(o.placedAt)]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-5 px-7">
      <p className="font-serif text-3xl italic">{title}</p>
      <p className="max-w-[34ch] text-[14px] leading-relaxed text-bone-dim">{body}</p>
      <Link href="/#shop" onClick={onClose} className="btn">
        <span>Shop the collection</span>
      </Link>
    </div>
  );
}
