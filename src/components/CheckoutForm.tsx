"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/actions";
import { freeShippingRemainingUsd, lineKey, totals } from "@/lib/cart";
import {
  customerSchema,
  validateField,
  type CustomerField,
  type CustomerFieldErrors,
  type CustomerInput,
} from "@/lib/checkout-schema";
import {
  countries,
  paymentLabels,
  paymentMethodsFor,
  shippingZones,
  shopConfig,
  zoneForCountry,
} from "@/lib/config";
import { formatMoney, formatUsdAs } from "@/lib/money";
import type { PaymentMethod } from "@/lib/types";
import { useCountry, useCurrency, useShop } from "@/store/shop";

const ORDER: CustomerField[] = [
  "email",
  "phone",
  "country",
  "name",
  "address1",
  "address2",
  "city",
  "region",
  "postalCode",
  "note",
];

function regionLabel(country: string) {
  if (country === "US") return "State";
  if (country === "CA") return "Province";
  if (country === "GB" || country === "IE") return "County (optional)";
  return "State / region (optional)";
}

function postalLabel(country: string) {
  if (country === "US") return "ZIP code";
  if (country === "BD") return "Postcode (optional)";
  return "Postcode";
}

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useShop((s) => s.hydrated);
  const lines = useShop((s) => s.lines);
  const draft = useShop((s) => s.draft);
  const setDraft = useShop((s) => s.setDraft);
  const rememberDetails = useShop((s) => s.rememberDetails);
  const setRememberDetails = useShop((s) => s.setRememberDetails);
  const recordOrder = useShop((s) => s.recordOrder);
  const clearBag = useShop((s) => s.clearBag);
  const toast = useShop((s) => s.toast);
  const openDrawer = useShop((s) => s.openDrawer);
  const currency = useCurrency();
  const country = useCountry();

  const [errors, setErrors] = useState<CustomerFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CustomerField, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentChoice, setPayment] = useState<PaymentMethod>("card");
  const [showAddress2, setShowAddress2] = useState(Boolean(draft.address2));
  const [placed, setPlaced] = useState(false);
  const [pending, startTransition] = useTransition();

  const methods = paymentMethodsFor(country);
  const payment = methods.includes(paymentChoice) ? paymentChoice : "card";
  const zone = shippingZones[zoneForCountry(country)];
  const sums = totals(lines, zoneForCountry(country), currency);
  const remaining = freeShippingRemainingUsd(lines);

  const value = (k: CustomerField) => (k === "country" ? country : (draft[k] ?? ""));

  const onChange =
    (k: CustomerField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setDraft({ [k]: v });
      // Once a field has been visited, keep its message in sync as they type.
      if (touched[k]) setErrors((er) => ({ ...er, [k]: validateField(k, v) }));
    };

  const onBlur = (k: CustomerField) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: validateField(k, value(k)) }));
  };

  const bind = (k: CustomerField) => ({
    id: `co-${k}`,
    name: k,
    value: value(k),
    onChange: onChange(k),
    onBlur: onBlur(k),
    "aria-invalid": Boolean(errors[k]),
    "aria-describedby": errors[k] ? `co-${k}-error` : undefined,
  });

  const field = (k: CustomerField, label: string, input: React.ReactNode, hint?: string) => (
    <div className="field" data-invalid={Boolean(errors[k])}>
      <label htmlFor={`co-${k}`}>{label}</label>
      {input}
      {errors[k] ? (
        <span id={`co-${k}-error`} className="field-error">
          {errors[k]}
        </span>
      ) : hint ? (
        <span className="text-[12.5px] text-bone-dim/70">{hint}</span>
      ) : null}
    </div>
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const customer = Object.fromEntries(ORDER.map((k) => [k, value(k)])) as CustomerInput;

    const check = customerSchema.safeParse(customer);
    if (!check.success) {
      const next: CustomerFieldErrors = {};
      for (const issue of check.error.issues) {
        next[issue.path[0] as CustomerField] ??= issue.message;
      }
      setErrors(next);
      setTouched(Object.fromEntries(ORDER.map((k) => [k, true])));
      const first = ORDER.find((k) => next[k]);
      document.getElementById(`co-${first}`)?.focus();
      return;
    }

    startTransition(async () => {
      const res = await placeOrder({
        customer,
        lines: lines.map(({ slug, colour, quantity }) => ({ slug, colour, quantity })),
        currency,
        payment,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.formError ?? "Please check the highlighted fields.");
        return;
      }
      setPlaced(true);
      recordOrder(res.order);
      clearBag();
      setDraft({ note: "" });
      toast(`Order ${res.order.id} confirmed`);
      router.push(`/orders/${res.order.id}`);
    });
  };

  if (!hydrated || placed) {
    return (
      <p className="py-24 font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase">
        {placed ? "Order confirmed — opening your receipt…" : "Loading your bag…"}
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 py-16">
        <p className="font-serif text-4xl italic">Your bag is empty.</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/#shop" className="btn">
            <span>Shop the collection</span>
          </Link>
          <button type="button" className="text-link" onClick={() => openDrawer("orders")}>
            View past orders
          </button>
        </div>
      </div>
    );
  }

  const sectionTitle =
    "font-mono text-[11px]! font-normal! tracking-[.14em] text-brass-bright uppercase";
  const payLabel =
    payment === "cod"
      ? `Place order — ${formatMoney(sums.total, currency)}`
      : `Pay ${formatMoney(sums.total, currency)} →`;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-14 min-[961px]:grid-cols-[1.2fr_1fr] min-[961px]:gap-20"
    >
      <div className="flex flex-col gap-12">
        {/* 01 Contact */}
        <fieldset className="flex flex-col gap-7">
          <legend className={`${sectionTitle} mb-7`}>01 — Contact</legend>
          {field(
            "email",
            "Email",
            <input {...bind("email")} type="email" autoComplete="email" inputMode="email" />,
            "For your receipt and tracking updates.",
          )}
          {field(
            "phone",
            "Phone (optional)",
            <input {...bind("phone")} type="tel" autoComplete="tel" placeholder="+1 555 010 0199" />,
            "Only shared with the courier, in case they need to reach you.",
          )}
        </fieldset>

        {/* 02 Shipping */}
        <fieldset className="flex flex-col gap-7">
          <legend className={`${sectionTitle} mb-7`}>02 — Shipping address</legend>
          {field(
            "country",
            "Country",
            <select {...bind("country")} autoComplete="country">
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>,
            `${zone.days} · ${
              sums.freeShipping
                ? "free shipping"
                : `${formatMoney(sums.shipping, currency)} tracked shipping`
            }`,
          )}
          {field("name", "Full name", <input {...bind("name")} autoComplete="name" />)}
          {field(
            "address1",
            "Street address",
            <input {...bind("address1")} autoComplete="address-line1" />,
          )}
          {showAddress2 ? (
            field(
              "address2",
              "Apartment, suite, etc. (optional)",
              <input {...bind("address2")} autoComplete="address-line2" />,
            )
          ) : (
            <button
              type="button"
              className="text-link -mt-3 self-start"
              onClick={() => setShowAddress2(true)}
            >
              + Add apartment, suite, etc.
            </button>
          )}
          <div className="grid gap-7 sm:grid-cols-2">
            {field("city", "Town / city", <input {...bind("city")} autoComplete="address-level2" />)}
            {field(
              "region",
              regionLabel(country),
              <input {...bind("region")} autoComplete="address-level1" />,
            )}
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            {field(
              "postalCode",
              postalLabel(country),
              <input {...bind("postalCode")} autoComplete="postal-code" />,
            )}
          </div>
          {field(
            "note",
            "Note for the workshop (optional)",
            <textarea {...bind("note")} rows={2} placeholder="A gift? Delivery instructions?" />,
          )}
          <label className="flex items-center gap-3 text-[14px] text-bone-dim">
            <input
              type="checkbox"
              checked={rememberDetails}
              onChange={(e) => setRememberDetails(e.target.checked)}
              className="h-4 w-4 accent-[var(--brass-bright)]"
            />
            Remember my details on this device for next time
          </label>
        </fieldset>

        {/* 03 Payment */}
        <fieldset className="flex flex-col gap-3">
          <legend className={`${sectionTitle} mb-4`}>03 — Payment</legend>
          {methods.map((m) => (
            <label
              key={m}
              className={`flex items-start gap-4 border px-5 py-4 transition-colors ${
                payment === m ? "border-brass bg-ink-2" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={m}
                checked={payment === m}
                onChange={() => setPayment(m)}
                className="mt-1 h-4 w-4 accent-[var(--brass-bright)]"
              />
              <span>
                <span className="block text-[15px]">{paymentLabels[m].title}</span>
                <span className="block text-[13px] text-bone-dim">{paymentLabels[m].detail}</span>
              </span>
            </label>
          ))}
          <p className="text-[12.5px] text-bone-dim/80">
            Demo store: payment is simulated and nothing is charged.
          </p>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="flex flex-col gap-6 self-start border border-line bg-ink-2 p-7 min-[961px]:sticky min-[961px]:top-24">
        <div className="flex items-baseline justify-between">
          <h2 className={sectionTitle}>Order summary</h2>
          <button type="button" className="text-link" onClick={() => openDrawer("bag")}>
            Edit bag
          </button>
        </div>
        <ul className="flex flex-col divide-y divide-line">
          {lines.map((l) => (
            <li key={lineKey(l)} className="flex items-center gap-4 py-4">
              <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-panel">
                <Image src={l.image} alt="" fill sizes="58px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-serif text-lg leading-tight">{l.name}</span>
                <span className="font-mono text-[10.5px] tracking-[.08em] text-bone-dim uppercase">
                  {l.colourLabel} × {l.quantity}
                </span>
              </div>
              <span className="font-mono text-[13px]">
                {formatUsdAs(l.unitPrice * l.quantity, currency)}
              </span>
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <p className="text-[13px] text-bone-dim">
            Add {formatUsdAs(remaining, currency)} more for free shipping.
          </p>
        )}

        <dl className="flex flex-col gap-3 border-t border-line pt-5 font-mono text-[12px] tracking-[.06em]">
          <div className="flex justify-between">
            <dt className="text-bone-dim">Subtotal</dt>
            <dd>{formatMoney(sums.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-bone-dim">Shipping · {zone.days}</dt>
            <dd>{sums.freeShipping ? "Free" : formatMoney(sums.shipping, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-[14px]">
            <dt>Total ({currency})</dt>
            <dd className="text-brass-bright">{formatMoney(sums.total, currency)}</dd>
          </div>
        </dl>

        {formError && (
          <p role="alert" className="border border-rust bg-rust/25 px-4 py-3 text-[13px]">
            {formError}
          </p>
        )}

        <button type="submit" className="btn w-full! self-stretch!" disabled={pending}>
          <span>
            {pending ? (payment === "cod" ? "Placing order…" : "Processing payment…") : payLabel}
          </span>
        </button>

        <ul className="trust-list">
          <li>Secure checkout</li>
          <li>{shopConfig.policies.tracked}</li>
          <li>{shopConfig.policies.returns}</li>
        </ul>
        <p className="text-[12.5px] leading-relaxed text-bone-dim/80">
          {shopConfig.policies.duties}{" "}
          <Link href="/shipping-returns" className="underline underline-offset-4">
            Details
          </Link>
          {" · "}Questions?{" "}
          <a
            href={`https://wa.me/${shopConfig.whatsapp}?text=${encodeURIComponent(
              "Hi Tennor & Co. — I have a question before I check out.",
            )}`}
            target="_blank"
            rel="noopener"
            className="underline underline-offset-4"
          >
            WhatsApp us
          </a>
        </p>
      </aside>
    </form>
  );
}
