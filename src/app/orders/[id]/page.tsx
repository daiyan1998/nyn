import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderView } from "@/components/OrderView";
import { PageMotion } from "@/components/PageMotion";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

const Loading = () => (
  <p className="py-24 font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase">
    Loading order…
  </p>
);

/** Orders live in the browser (mock), so the id is runtime-only data. */
export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <section className="min-h-svh border-b border-line px-[22px] pt-[96px] pb-24 md:px-[44px] md:pt-[120px]">
      <div className="mx-auto max-w-[1240px]">
        <Suspense fallback={<Loading />}>
          {params.then(({ id }) => (
            <OrderView id={decodeURIComponent(id)} />
          ))}
        </Suspense>
      </div>
      <PageMotion />
    </section>
  );
}
