import type { Metadata } from "next";
import { PageMotion } from "@/components/PageMotion";
import { Price } from "@/components/Price";
import { countries, shippingZones, shopConfig } from "@/lib/config";
import type { ShippingZoneId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Worldwide tracked shipping from Dhaka, delivery times, duties and returns.",
};

const faqs = [
  {
    q: "Where do you ship from?",
    a: "Every order is made and packed at our workshop in Dhaka, Bangladesh, and handed to a tracked international courier.",
  },
  {
    q: "When will I get a tracking number?",
    a: "As soon as your order ships — we email it to you, and it also appears on your order page.",
  },
  {
    q: "Will I pay customs or import duties?",
    a: shopConfig.policies.duties,
  },
  {
    q: "What is your return policy?",
    a: shopConfig.policies.returnsDetail,
  },
  {
    q: "Which payment methods do you accept?",
    a: "Visa, Mastercard, American Express and PayPal. Cash on delivery is available within Bangladesh.",
  },
];

export default function ShippingReturnsPage() {
  const zoneIds = Object.keys(shippingZones) as ShippingZoneId[];
  return (
    <section className="min-h-svh border-b border-line px-[22px] pt-[96px] pb-24 md:px-[44px] md:pt-[120px]">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-16">
        <div>
          <div className="eyebrow reveal mb-4">Help</div>
          <h1 className="reveal text-[clamp(40px,5vw,76px)]">
            Shipping &amp; <em className="font-normal text-brass-bright italic">returns</em>.
          </h1>
          <p className="reveal mt-6 max-w-[56ch] text-[15.5px] leading-[1.7] text-bone-dim">
            Handmade in Dhaka, shipped tracked to over {countries.length}{" "}
            countries. Free shipping on orders over{" "}
            <Price usd={shopConfig.freeShippingOverUsd} />.
          </p>
        </div>

        <div className="reveal overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Shipping rates and delivery times</caption>
            <thead>
              <tr className="border-b border-line font-mono text-[11px] tracking-[.14em] text-brass-bright uppercase">
                <th className="py-3 pr-4 font-normal">Destination</th>
                <th className="py-3 pr-4 font-normal">Delivery</th>
                <th className="py-3 font-normal">Tracked shipping</th>
              </tr>
            </thead>
            <tbody>
              {zoneIds.map((id) => (
                <tr key={id} className="border-b border-line">
                  <td className="py-4 pr-4">{shippingZones[id].label}</td>
                  <td className="py-4 pr-4 text-bone-dim">{shippingZones[id].days}</td>
                  <td className="py-4">
                    <Price usd={shippingZones[id].rateUsd} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="flex flex-col divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.q} className="reveal grid gap-2 py-6 md:grid-cols-[1fr_1.4fr] md:gap-10">
              <dt className="font-serif text-xl">{f.q}</dt>
              <dd className="text-[15px] leading-[1.7] text-bone-dim">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <PageMotion />
    </section>
  );
}
