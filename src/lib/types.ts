export type ColourId = "brown" | "black" | "tan";

export type Variant = {
  colour: ColourId;
  label: string;
  swatch: string;
  stock: number;
};

export type Spec = { label: string; value: string };

/** width/height are the source's intrinsic size, when known. */
export type ProductImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Product = {
  slug: string;
  number: string;
  category: string;
  name: string;
  /** Base price in USD. Display currencies are converted from this. */
  price: number;
  description: string;
  specs: Spec[];
  images: ProductImage[];
  /** Which colour the main photo shows, so we can say so when it differs. */
  photoColour?: ColourId;
  variants: Variant[];
};

/**
 * A line in the bag. Name, price, image and stock are a snapshot taken when
 * the item was added — display-only. The server re-prices and re-checks stock
 * on checkout. `unitPrice` is in USD.
 */
export type CartLine = {
  slug: string;
  colour: ColourId;
  colourLabel: string;
  name: string;
  unitPrice: number;
  image: string;
  maxStock: number;
  quantity: number;
};

export type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "BDT";

export type ShippingZoneId =
  | "bd"
  | "south-asia"
  | "asia"
  | "europe"
  | "north-america"
  | "rest";

export type PaymentMethod = "card" | "paypal" | "cod";

export type OrderLine = {
  slug: string;
  name: string;
  colour: ColourId;
  colourLabel: string;
  /** In the order's currency. */
  unitPrice: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  placedAt: string;
  currency: CurrencyCode;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country: string;
    address1: string;
    address2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    note?: string;
  };
  zone: ShippingZoneId;
  deliveryEstimate: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: PaymentMethod;
};
