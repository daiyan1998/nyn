import type { Product, ProductImage, Variant } from "../types";

const unsplash = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;

/** Shared detail shots used to pad out product galleries (dummy imagery). */
const detailShots: ProductImage[] = [
  {
    src: unsplash("1658255307973-1a3aab57a539"),
    alt: "A hand holding a full-grain leather wallet, close up",
  },
  {
    src: unsplash("1678449544865-c03dc897112d"),
    alt: "Hand holding a full-grain leather wallet",
  },
  {
    src: unsplash("1778883008356-f7b3789a3073"),
    alt: "Leather hide texture on the workbench",
  },
];

const gallery = (main: ProductImage, offset: number): ProductImage[] => [
  main,
  detailShots[offset % 3],
  detailShots[(offset + 1) % 3],
];

const colours = {
  brown: { colour: "brown", label: "Saddle Brown", swatch: "#8a5636" },
  black: { colour: "black", label: "Black", swatch: "#1d1712" },
  tan: { colour: "tan", label: "Natural Tan", swatch: "#d9b48c" },
} as const;

const v = (c: keyof typeof colours, stock: number): Variant => ({
  ...colours[c],
  stock,
});

const madeIn = { label: "Made in", value: "Handmade in Dhaka" };

/** PLACEHOLDER prices in USD — confirm international pricing with the owner. */
export const products: Product[] = [
  {
    slug: "the-ledger",
    number: "01",
    category: "Long Wallet",
    name: "The Ledger",
    price: 48,
    description:
      "A full-length bifold built for the wallet you'll carry for a decade. Eight card slots, a full bill compartment, and a brass snap that gets more satisfying with every close.",
    specs: [
      { label: "Leather", value: "Veg-tan cowhide" },
      { label: "Capacity", value: "8 cards + bills" },
      { label: "Hardware", value: "Solid brass" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1512415073221-64c70eee25bc"),
        alt: "The Ledger, a full-grain leather long wallet",
        width: 2000,
        height: 1500,
      },
      0,
    ),
    photoColour: "brown",
    variants: [v("brown", 8), v("black", 5), v("tan", 3)],
  },
  {
    slug: "the-fold",
    number: "02",
    category: "Short Wallet",
    name: "The Fold",
    price: 36,
    description:
      "The pocket-shaped version of The Ledger. A trifold card case that carries four cards, folded cash, and nothing you don't need — cut from a single piece of hide.",
    specs: [
      { label: "Leather", value: "Veg-tan cowhide" },
      { label: "Capacity", value: "4 cards + cash" },
      { label: "Hardware", value: "None — pure fold" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1579014134953-1580d7f123f3"),
        alt: "The Fold, a compact leather short wallet",
        width: 2000,
        height: 1335,
      },
      1,
    ),
    photoColour: "black",
    // Tan is deliberately sold out to demo the sold-out state.
    variants: [v("black", 6), v("brown", 4), v("tan", 0)],
  },
  {
    slug: "the-satchel-sleeve",
    number: "03",
    category: "Laptop Pouch",
    name: "The Satchel Sleeve",
    price: 62,
    description:
      'A structured pouch for 13"–16" laptops, lined in undyed wool felt and closed with a brass turn-lock. Slim enough for a tote, stiff enough to protect on its own.',
    specs: [
      { label: "Leather", value: "Veg-tan cowhide" },
      { label: "Fits", value: '13"–16" laptops' },
      { label: "Lining", value: "Wool felt" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1675668409245-955188b96bf6"),
        alt: "The Satchel Sleeve, a leather laptop pouch carried by hand",
        width: 2000,
        height: 1333,
      },
      2,
    ),
    photoColour: "black",
    variants: [v("brown", 3), v("black", 2), v("tan", 1)],
  },
  {
    slug: "the-loop",
    number: "04",
    category: "Key Ring",
    name: "The Loop",
    price: 18,
    description:
      "A solid brass ring on a hand-cut leather tab, riveted twice. Small enough to disappear in a pocket, heavy enough that you'll always know it's there.",
    specs: [
      { label: "Leather", value: "Veg-tan offcut" },
      { label: "Ring", value: "Solid brass, 30mm" },
      { label: "Fixing", value: "Double copper rivet" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1675582090584-4ae9400f7326"),
        alt: "The Loop, a leather key ring next to a wallet on a table",
        width: 2000,
        height: 1333,
      },
      0,
    ),
    photoColour: "black",
    variants: [v("brown", 15), v("black", 12), v("tan", 2)],
  },
  {
    slug: "the-slip",
    number: "05",
    category: "Card Holder",
    name: "The Slip",
    price: 28,
    description:
      "A single fold of veg-tan hide that carries five cards and nothing else. No stitching to fail, no lining to wear through — just leather that gets thinner and softer with every year you carry it.",
    specs: [
      { label: "Leather", value: "Veg-tan cowhide" },
      { label: "Capacity", value: "5 cards" },
      { label: "Hardware", value: "None — pure fold" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1620109176813-e91290f6c795"),
        alt: "The Slip, a compact leather card holder",
        width: 2000,
        height: 1333,
      },
      1,
    ),
    photoColour: "brown",
    variants: [v("brown", 10), v("black", 7), v("tan", 6)],
  },
  {
    slug: "the-hitch",
    number: "06",
    category: "Key Chain",
    name: "The Hitch",
    price: 20,
    description:
      "A slimmer sibling to The Loop — a braided leather strap on a nickel clip, built to hang from a bag or belt loop rather than sit in a pocket.",
    specs: [
      { label: "Leather", value: "Veg-tan offcut" },
      { label: "Clip", value: "Nickel-plated" },
      { label: "Length", value: "12cm" },
      madeIn,
    ],
    images: gallery(
      {
        src: unsplash("1687363714985-990685339050"),
        alt: "The Hitch, a leather key chain",
        width: 2000,
        height: 3000,
      },
      2,
    ),
    variants: [v("brown", 9), v("black", 4)],
  },
];

/** Shown as "coming soon" — not yet purchasable. */
export const comingSoon: string[] = [
  "Passport Holder",
  "Coin Pouch",
  "Belt",
  "Phone Sleeve",
  "Tote Bag",
  "Sunglasses Case",
];
