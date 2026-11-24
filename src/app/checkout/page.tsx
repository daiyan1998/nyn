import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { PageMotion } from "@/components/PageMotion";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <section className="min-h-svh border-b border-line px-[22px] pt-[96px] pb-24 md:px-[44px] md:pt-[120px]">
      <div className="mx-auto max-w-[1240px]">
        <div className="eyebrow mb-4">Checkout</div>
        <h1 className="mb-14 text-[clamp(40px,5vw,76px)]">
          Almost <em className="font-normal text-brass-bright italic">yours</em>.
        </h1>
        <CheckoutForm />
      </div>
      <PageMotion />
    </section>
  );
}
