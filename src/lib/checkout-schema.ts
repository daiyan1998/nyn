import { z } from "zod";
import { countryCodes, currencyCodes } from "./config";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((s) => s || undefined);

/** International phone: optional; digits with an optional leading +, 7–15 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s ? s.replace(/[\s\-().]/g, "") : undefined))
  .pipe(
    z
      .string()
      .regex(/^\+?\d{7,15}$/, "Enter a phone number with country code, e.g. +44 20 7946 0958")
      .optional(),
  );

export const customerSchema = z.object({
  email: z.email("Enter a valid email so we can send your receipt and tracking"),
  phone: phoneSchema,
  name: z.string().trim().min(2, "Enter the recipient's full name").max(80),
  country: z.enum(countryCodes, { error: "Choose the country we're shipping to" }),
  address1: z.string().trim().min(4, "Enter a street address").max(120),
  address2: optionalText(120),
  city: z.string().trim().min(2, "Enter a town or city").max(80),
  region: optionalText(80),
  postalCode: optionalText(16),
  note: optionalText(300),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerField = keyof CustomerInput;
export type CustomerFieldErrors = Partial<Record<CustomerField, string>>;

/** Validate one field on blur. Returns the message, or undefined if valid. */
export function validateField(field: CustomerField, value: string): string | undefined {
  const res = customerSchema.shape[field].safeParse(value);
  return res.success ? undefined : res.error.issues[0]?.message;
}

export const checkoutLineSchema = z.object({
  slug: z.string(),
  colour: z.enum(["brown", "black", "tan"]),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  lines: z.array(checkoutLineSchema).min(1, "Your bag is empty"),
  currency: z.enum(currencyCodes),
  payment: z.enum(["card", "paypal", "cod"]),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address"),
});
