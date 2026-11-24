import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PageMotion } from "@/components/PageMotion";
import { Price } from "@/components/Price";
import { ProductBuyInline } from "@/components/ProductBuyInline";
import { shopConfig } from "@/lib/config";
import { catalog } from "@/lib/data";

const marqueeItems = [
  "Full-grain leather",
  "Hand saddle-stitched",
  "Solid brass hardware",
  "Made to outlast the receipt",
];

const craftSteps = [
  {
    title: "Hide selection",
    body: "We grade full-grain hides by hand, choosing the panels with the fewest natural marks for the pieces that take the most wear.",
  },
  {
    title: "Cutting",
    body: "Every panel is cut against the direction of the grain — slower, but the difference between a wallet that stretches evenly and one that doesn't.",
  },
  {
    title: "Saddle stitching",
    body: "Two needles, one waxed thread, pulled through by hand. If one thread ever fails, the seam still holds.",
  },
  {
    title: "Edge burnishing",
    body: "Raw edges are sanded, dyed to match, then burnished with beeswax until they seal into a smooth, rounded line.",
  },
  {
    title: "Finishing",
    body: "Brass hardware is set, the piece is stamped with the Tennor mark, and inspected under raking light before it ships.",
  },
];

const materials = [
  {
    title: "Veg-tan cowhide",
    body: "Tanned with tree bark and oils rather than chromium salts — it darkens and softens with handling instead of just wearing out.",
  },
  {
    title: "Waxed linen thread",
    body: "Pulled taut by hand through every saddle stitch. It resists moisture and won't fray at the seam like cotton thread does.",
  },
  {
    title: "Solid brass hardware",
    body: "Snaps, rings and rivets machined from solid brass, not plated — the finish ages into the piece rather than flaking off it.",
  },
  {
    title: "Undyed wool felt",
    body: "Used to line the Satchel Sleeve — naturally water-resistant and soft enough not to mark a laptop's shell over time.",
  },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default async function Home() {
  const [products, comingSoon] = await Promise.all([
    catalog.list(),
    catalog.comingSoon(),
  ]);

  return (
    <>
      <section id="hero">
        <div className="bg">
          <Image
            src="https://images.unsplash.com/photo-1678449544865-c03dc897112d?auto=format&fit=crop&w=2600&q=88"
            alt="Hand holding a full-grain leather wallet"
            fill
            sizes="100vw"
            quality={85}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="hero-inner">
          <h1 className="reveal">
            Leather that <em>remembers</em>
            <br />
            every day you carry it.
          </h1>
          <div className="hero-row">
            <div className="hero-actions">
              <p className="hero-sub reveal">
                Full-grain wallets, key rings and carry goods, hand cut and
                saddle-stitched by a small workshop for people who use things
                until they earn their patina.
              </p>
              <div className="hero-sub reveal flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/#shop" className="btn">
                  <span>Shop the collection →</span>
                </Link>
                <span className="hero-note">
                  Handmade in Dhaka · Ships worldwide
                </span>
              </div>
            </div>
            <div className="scroll-cue">
              <span>Scroll</span>
              <span className="stick" />
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-label={marqueeItems.join(" · ")}>
        <div className="marquee-track" aria-hidden="true">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>
              {item}
              <span />
            </span>
          ))}
        </div>
      </div>

      <section id="shop" aria-labelledby="shop-title">
        <div className="shop-head">
          <div>
            <div className="eyebrow reveal">
              The collection — {String(products.length).padStart(2, "0")}{" "}
              pieces
            </div>
            <h2 id="shop-title" className="reveal">
              Choose your piece.
            </h2>
          </div>
          <div className="reveal flex flex-col gap-4">
            <p>
              Every piece is made to order in small batches and shipped,
              tracked, to your door.
            </p>
            <ul className="trust-list">
              <li>
                Free shipping over{" "}
                <Price usd={shopConfig.freeShippingOverUsd} />
              </li>
              <li>{shopConfig.policies.returns}</li>
              <li>Secure checkout</li>
            </ul>
          </div>
        </div>
        <ul className="shop-grid">
          {products.map((p) => (
            <li key={p.slug} className="reveal">
              <Link href={`/products/${p.slug}`} className="shop-card">
                <div className="shop-img">
                  <Image
                    src={p.images[0].src}
                    alt={p.images[0].alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 17vw"
                  />
                </div>
                <div className="shop-meta">
                  <span className="shop-name">{p.name}</span>
                  <span className="shop-sub">
                    <span>{p.category}</span>
                    <Price usd={p.price} className="price" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="statement">
        <p className="reveal">
          <span className="fade">Most wallets are built to be replaced.</span>{" "}
          Ours are built around a single hide, cut by one pair of hands, so the
          leather ages the way yours does —{" "}
          <span className="fade">
            honestly, and a little slower than you&apos;d expect.
          </span>
        </p>
      </section>

      <section id="parallax">
        <div className="px-img">
          <Image
            id="parallax-img"
            src="https://images.unsplash.com/photo-1658255307973-1a3aab57a539?auto=format&fit=crop&w=2600&q=88"
            alt="A hand holding a full-grain leather wallet, close up"
            fill
            sizes="100vw"
            quality={85}
          />
        </div>
        <div className="px-content">
          <div className="eyebrow reveal">Handcrafted in Dhaka</div>
          <h2 className="reveal">
            One hide. One pair
            <br />
            of hands. Every time.
          </h2>
          <p className="reveal">
            Every Tennor piece is cut, stitched and finished by the same small
            team in Dhaka — not a factory line. That&apos;s why we can only
            make so many at once, and why each one looks a little different
            from the last.
          </p>
          <div className="px-tag reveal">Est. in Bangladesh</div>
        </div>
      </section>

      <section id="craft-steps">
        <div className="craft-steps-head">
          <div className="eyebrow reveal">The process — 01–05</div>
          <h2 className="reveal">How a hide becomes a wallet.</h2>
          <p className="reveal">Five stages, done in order, by hand.</p>
        </div>
        <div className="craft-steps-grid">
          {craftSteps.map((s, i) => (
            <div className="craft-step reveal" key={s.title}>
              <div className="craft-num">{pad(i)}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="wallets">
        {products.map((p, i) => (
          <div
            className={`product${i % 2 ? " rev" : ""}`}
            key={p.slug}
            id={p.slug}
          >
            <Link
              href={`/products/${p.slug}`}
              className="product-media reveal"
              aria-label={`View ${p.name}`}
            >
              <span className="tag">
                {p.number} — {p.category}
              </span>
              {/* Intrinsic size (not `fill`): like the original, a tall photo
                  can make its row taller than the viewport. */}
              <Image
                src={p.images[0].src}
                alt={p.images[0].alt}
                width={p.images[0].width ?? 2000}
                height={p.images[0].height ?? 1333}
                sizes="(max-width: 860px) 100vw, 50vw"
                quality={85}
              />
            </Link>
            <div className="product-info">
              <div className="eyebrow reveal">{p.category}</div>
              <h2 className="reveal">
                <Link href={`/products/${p.slug}`}>{p.name}</Link>
              </h2>
              <div className="price reveal">
                <Price usd={p.price} />
              </div>
              <p className="desc reveal">{p.description}</p>
              <div className="spec-list reveal">
                {p.specs.map((s) => (
                  <div key={s.label}>
                    {s.label}
                    <b>{s.value}</b>
                  </div>
                ))}
              </div>
              <ProductBuyInline product={p} />
            </div>
          </div>
        ))}
      </section>

      <section id="materials">
        <div className="mat-head">
          <div className="eyebrow reveal">What it&apos;s made of</div>
          <h2 className="reveal">
            Four materials.
            <br />
            No filler.
          </h2>
          <p className="reveal">
            Everything Tennor makes is built from the same short list of
            components — chosen once, sourced consistently, and never swapped
            out to hit a lower price.
          </p>
        </div>
        <div className="mat-grid">
          {materials.map((m, i) => (
            <div className="mat-cell reveal" key={m.title}>
              <div className="num">{pad(i)}</div>
              <h4>{m.title}</h4>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
        <div className="more-products reveal">
          <p>And many more, always in small batches</p>
          <ul className="chip-row">
            {comingSoon.map((name) => (
              <li key={name} title="Coming soon">
                {name}
                <span className="sr-only"> (coming soon)</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="quote">
        <div className="eyebrow reveal">From the workshop</div>
        <blockquote className="reveal">
          &ldquo;We&apos;re not trying to make a wallet you&apos;ll love on day
          one. We&apos;re trying to make one you still reach for after five
          years, when the leather&apos;s gone the color of strong tea.&rdquo;
        </blockquote>
        <cite className="reveal">— Founder&apos;s note, Tennor &amp; Co.</cite>
      </section>

      <section id="cta">
        <div className="cta-inner">
          <h2 className="reveal">Follow the patina.</h2>
          <p className="reveal">
            One email a month — new small-batch releases, restocks, and notes
            from the bench. No filler, same as the leather.
          </p>
          <NewsletterForm />
          <p className="cta-contact reveal">
            Or reach us directly —{" "}
            <a href={`mailto:${shopConfig.email}`}>{shopConfig.email}</a> ·{" "}
            <a href={`tel:${shopConfig.phone}`}>{shopConfig.phoneDisplay}</a>
          </p>
        </div>
      </section>

      <PageMotion />
    </>
  );
}
