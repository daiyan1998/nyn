import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageMotion } from "@/components/PageMotion";
import { ProductGallery } from "@/components/ProductGallery";
import { Price } from "@/components/Price";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ShippingEstimate } from "@/components/ShippingInfo";
import { shopConfig } from "@/lib/config";
import { catalog } from "@/lib/data";

export async function generateStaticParams() {
  const products = await catalog.list();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.get(slug);
  if (!product) return {};
  return {
    title: `${product.name} · ${product.category}`,
    description: product.description,
    openGraph: {
      title: `${product.name} — Tennor & Co.`,
      description: product.description,
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await catalog.get(slug);
  if (!product) notFound();

  const others = (await catalog.list())
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <section className="border-b border-line px-[22px] pt-[96px] pb-20 md:px-[44px] md:pt-[120px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 font-mono text-[11px] tracking-[.14em] text-bone-dim uppercase"
        >
          <Link href="/#shop" className="hover:text-bone">
            Shop
          </Link>{" "}
          / <span className="text-bone">{product.name}</span>
        </nav>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 min-[861px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[861px]:gap-16">
          <div className="min-[861px]:sticky min-[861px]:top-24 min-[861px]:self-start">
            <ProductGallery
              images={product.images}
              tag={`${product.number} — ${product.category}`}
            />
          </div>

          <div className="flex flex-col gap-[22px]">
            <div className="eyebrow reveal">{product.category}</div>
            <h1 className="reveal text-[clamp(40px,5vw,76px)]">{product.name}</h1>
            <div className="price reveal">
              <Price usd={product.price} />
            </div>
            <p className="reveal max-w-[46ch] text-[15.5px] leading-[1.75] text-bone-dim">
              {product.description}
            </p>
            <div className="reveal mt-2 border-t border-line pt-7">
              <ProductPurchase product={product} />
            </div>
            <div className="spec-list reveal mt-4">
              {product.specs.map((s) => (
                <div key={s.label}>
                  {s.label}
                  <b>{s.value}</b>
                </div>
              ))}
            </div>
            <div className="reveal mt-4 flex flex-col gap-5 border border-line bg-ink-2 px-6 py-5">
              <ShippingEstimate />
              <ul className="trust-list border-t border-line pt-4">
                <li>{shopConfig.policies.tracked}</li>
                <li>{shopConfig.policies.returns}</li>
                <li>Secure card &amp; PayPal checkout</li>
              </ul>
              <p className="text-[12.5px] leading-relaxed text-bone-dim/80">
                {shopConfig.policies.duties}{" "}
                <Link href="/shipping-returns" className="underline underline-offset-4">
                  Shipping &amp; returns
                </Link>
              </p>
            </div>
            <dl className="reveal grid gap-px border border-line bg-line text-[13px] sm:grid-cols-2">
              {[
                ["Care", "Wipe dry; condition now and then with a leather balm"],
                ["Made", "Hand cut and saddle-stitched in Dhaka"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink px-5 py-4">
                  <dt className="mb-1 font-mono text-[11px] tracking-[.14em] text-brass-bright uppercase">
                    {k}
                  </dt>
                  <dd className="leading-relaxed text-bone-dim">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-ink-2 px-[22px] py-24 md:px-[44px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow reveal mb-4">Carried alongside</div>
            <h2 className="reveal text-[clamp(30px,4vw,52px)]">From the same bench.</h2>
          </div>
          <Link href="/#shop" className="text-link reveal">
            All pieces →
          </Link>
        </div>
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {others.map((p) => (
            <li key={p.slug} className="reveal bg-ink-2">
              <Link href={`/products/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-panel">
                  <Image
                    src={p.images[0].src}
                    alt={p.images[0].alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-leather group-hover:scale-105"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-4 px-6 py-5">
                  <div>
                    <div className="eyebrow mb-1.5">{p.category}</div>
                    <span className="font-serif text-2xl">{p.name}</span>
                  </div>
                  <Price usd={p.price} className="price text-sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PageMotion />
    </>
  );
}
