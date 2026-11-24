"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { findCountry, paymentLabels, shopConfig } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { orderStages, stageAt, stageLabels } from "@/lib/order-status";
import { useShop } from "@/store/shop";

/** Deterministic mock tracking number derived from the order id. */
const trackingFor = (id: string) => `TN${id.replace(/\W/g, "").slice(-9)}BD`;

export function OrderView({ id }: { id: string }) {
  const hydrated = useShop((s) => s.hydrated);
  const order = useShop((s) => s.orders.find((o) => o.id === id));
  const [now, setNow] = useState(() => new Date());

  // Re-evaluate the mock status periodically so it advances on screen.
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(t);
  }, []);

  if (!hydrated) {
    return (
      <p className="py-24 font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase">
        Loading order…
      </p>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-6 py-10">
        <h1 className="text-[clamp(36px,4.6vw,64px)]">Order not found.</h1>
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-bone-dim">
          Order <span className="font-mono text-bone">{id}</span> isn&apos;t
          saved on this device. Your confirmation email has a link to it — or
          message us with the order number and we&apos;ll help.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/#shop" className="btn">
            <span>Back to the shop</span>
          </Link>
          <a href={`mailto:${shopConfig.email}?subject=${encodeURIComponent(`Order ${id}`)}`} className="text-link">
            Email us
          </a>
        </div>
      </div>
    );
  }

  const stage = stageAt(order.placedAt, now);
  const stageIndex = orderStages.indexOf(stage);
  const placed = new Date(order.placedAt);
  const money = (n: number) => formatMoney(n, order.currency);
  const c = order.customer;
  const countryName = findCountry(c.country)?.name ?? c.country;

  const stageCopy = {
    placed: `Thank you — your order is in. A confirmation has been sent to ${c.email}.`,
    confirmed: "Confirmed. Your pieces are being finished, inspected and packed in Dhaka.",
    shipped: `On its way to ${countryName}. Expected delivery: ${order.deliveryEstimate}.`,
  } as const;

  const help = `Hi Tennor & Co. — I have a question about my order ${order.id}.`;

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-5">
        <div className="eyebrow">Order {order.id}</div>
        <h1 className="text-[clamp(40px,5vw,76px)]">
          Thank you,{" "}
          <em className="font-normal text-brass-bright italic">{c.name.split(" ")[0]}</em>.
        </h1>
        <p className="max-w-[56ch] text-[15.5px] leading-[1.7] text-bone-dim">
          {stageCopy[stage]}
        </p>
      </div>

      <ol className="grid gap-px border border-line bg-line sm:grid-cols-3" aria-label="Order progress">
        {orderStages.map((s, i) => {
          const done = i <= stageIndex;
          return (
            <li
              key={s}
              aria-current={i === stageIndex ? "step" : undefined}
              className={`flex flex-col gap-2 px-6 py-6 ${done ? "bg-ink-2" : "bg-ink"}`}
            >
              <span className={`font-mono text-[12px] ${done ? "text-brass-bright" : "text-bone-dim/50"}`}>
                {String(i + 1).padStart(2, "0")} {done ? "●" : "○"}
              </span>
              <span className={`font-serif text-2xl ${done ? "" : "text-bone-dim/50"}`}>
                {stageLabels[s]}
              </span>
              {s === "shipped" && done && (
                <span className="font-mono text-[11px] tracking-[.08em] text-bone-dim">
                  Tracking: {trackingFor(order.id)}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-12 min-[961px]:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="mb-4 font-mono text-[11px]! font-normal! tracking-[.14em] text-brass-bright uppercase">
            Items
          </h2>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {order.lines.map((l) => (
              <li key={`${l.slug}:${l.colour}`} className="flex items-center gap-5 py-5">
                <Link
                  href={`/products/${l.slug}`}
                  className="relative h-[90px] w-[72px] shrink-0 overflow-hidden bg-panel"
                >
                  <Image src={l.image} alt={l.name} fill sizes="72px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-serif text-xl">{l.name}</span>
                  <span className="font-mono text-[11px] tracking-[.08em] text-bone-dim uppercase">
                    {l.colourLabel} × {l.quantity} · {money(l.unitPrice)} each
                  </span>
                </div>
                <span className="font-mono text-[13px]">{money(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 flex flex-col gap-3 font-mono text-[12px] tracking-[.06em]">
            <div className="flex justify-between">
              <dt className="text-bone-dim">Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bone-dim">Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : money(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-[14px]">
              <dt>{order.payment === "cod" ? "Total due on delivery" : "Total paid"}</dt>
              <dd className="text-brass-bright">{money(order.total)}</dd>
            </div>
          </dl>
        </div>

        <dl className="grid gap-px self-start border border-line bg-line text-[14px]">
          {[
            ["Placed", placed.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })],
            ["Estimated delivery", order.deliveryEstimate],
            [
              "Ship to",
              [c.name, c.address1, c.address2, [c.city, c.region, c.postalCode].filter(Boolean).join(", "), countryName]
                .filter(Boolean)
                .join("\n"),
            ],
            ["Contact", [c.email, c.phone].filter(Boolean).join("\n")],
            ["Payment", paymentLabels[order.payment].title],
            ...(c.note ? [["Note", c.note]] : []),
          ].map(([k, v]) => (
            <div key={k} className="bg-ink-2 px-6 py-4">
              <dt className="mb-1 font-mono text-[11px] tracking-[.14em] text-brass-bright uppercase">{k}</dt>
              <dd className="leading-relaxed whitespace-pre-line text-bone-dim">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[46ch] text-[14px] leading-relaxed text-bone-dim">
          Questions about this order? Message us with your order number — we
          usually reply within a few hours.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <a
            href={`https://wa.me/${shopConfig.whatsapp}?text=${encodeURIComponent(help)}`}
            target="_blank"
            rel="noopener"
            className="btn btn-ghost"
          >
            <span>WhatsApp us</span>
          </a>
          <Link href="/#shop" className="btn">
            <span>Continue shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
