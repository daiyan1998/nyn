# Tennor & Co. — Next.js rebuild

A Next.js rebuild of the Tennor & Co. single-page site (https://tennor-and-co-8f5c2.web.app/), with the shop features working on mock data.

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # unit tests (Vitest)
pnpm test:e2e       # end-to-end tests (Playwright; builds and starts the app on :3100)
```

## What's real and what's mocked

There is no database, real payment or email. Everything else works, set up for **international** customers:

| Feature | How it works |
| --- | --- |
| Products | `src/lib/data/products.data.ts` (prices in USD), read through the `Catalog` interface in `src/lib/data/index.ts`. To use a real backend, replace `mockCatalog`. |
| Currency | Detected from the browser (en-GB → GBP, de-DE → EUR…), changeable in the header or mobile menu. Mock exchange rates are in `src/lib/config.ts`. |
| Shipping | Six worldwide zones with rates and delivery estimates, free over $120, all in `src/lib/config.ts`. Destination is detected and can be changed in the bag or at checkout. |
| Bag | Zustand store saved in `localStorage` (`src/store/shop.ts`). Shows a free-shipping progress bar and the full total before checkout. |
| Checkout | Server action `placeOrder` (`src/app/actions.ts`). Validates with zod, re-prices from the catalogue, checks stock, simulates payment (card / PayPal, or cash on delivery for Bangladesh only), and returns a fake order. Fields are checked as soon as the customer leaves them; a draft is saved and remembered for next time. |
| Orders | Saved in the browser that placed them. `/orders/[id]` moves Placed → Confirmed → Shipped (with a mock tracking number). |
| Contact | Floating "Ask us" button that opens WhatsApp or email, pre-filled with the product or order being viewed. |

**Placeholders to confirm before launch** are marked `PLACEHOLDER` in `src/lib/config.ts` and `products.data.ts`: USD prices, exchange rates, shipping rates and times, the free-shipping threshold, the return policy wording, and social links (hidden until set).

The Fold in tan is out of stock on purpose, to show the sold-out state.

## Structure

- `src/app/page.tsx`: the original page ported section by section. Its CSS is ported into `globals.css` with the original class names and design tokens. New pages use Tailwind with the same tokens (`bg-ink`, `text-brass-bright`, `font-mono`…).
- `src/components/PageMotion.tsx`: GSAP + ScrollTrigger ported from the original (hero entrance, scroll reveals, parallax, stitch rail). It respects `prefers-reduced-motion`.
- `src/app/products/[slug]`, `src/app/checkout`, `src/app/orders/[id]`: pages that don't exist on the original.

Images are Unsplash placeholders, as on the original site.
