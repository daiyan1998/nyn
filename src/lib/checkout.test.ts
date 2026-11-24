import { describe, expect, it } from "vitest";
import { customerSchema, phoneSchema, validateField } from "./checkout-schema";
import { detectCountry, paymentMethodsFor, zoneForCountry } from "./config";
import { formatMoney } from "./money";
import { stageAt } from "./order-status";

describe("phoneSchema", () => {
  it.each(["+44 20 7946 0958", "+1 (555) 010-0199", "+8801712345678", "0412345678"])(
    "accepts %s",
    (input) => {
      expect(phoneSchema.safeParse(input).success).toBe(true);
    },
  );

  it("is optional", () => {
    expect(phoneSchema.parse("")).toBeUndefined();
  });

  it.each(["123", "phone number"])("rejects %s", (input) => {
    expect(phoneSchema.safeParse(input).success).toBe(false);
  });
});

describe("customerSchema", () => {
  const valid = {
    email: "sam@example.com",
    phone: "",
    name: "Sam Taylor",
    country: "GB",
    address1: "12 Example Street",
    address2: "",
    city: "London",
    region: "",
    postalCode: "N1 9GU",
    note: "",
  };

  it("accepts a valid customer and drops empty optionals", () => {
    const out = customerSchema.parse(valid);
    expect(out.phone).toBeUndefined();
    expect(out.address2).toBeUndefined();
  });

  it("requires an email", () => {
    expect(customerSchema.safeParse({ ...valid, email: "" }).success).toBe(false);
  });

  it("rejects a country we don't ship to", () => {
    expect(customerSchema.safeParse({ ...valid, country: "XX" }).success).toBe(false);
  });
});

describe("validateField", () => {
  it("returns a message for invalid input and nothing for valid", () => {
    expect(validateField("email", "nope")).toMatch(/valid email/);
    expect(validateField("email", "a@b.co")).toBeUndefined();
  });
});

describe("shipping and payment rules", () => {
  it("maps countries to zones", () => {
    expect(zoneForCountry("GB")).toBe("europe");
    expect(zoneForCountry("US")).toBe("north-america");
    expect(zoneForCountry("BD")).toBe("bd");
  });

  it("offers cash on delivery only in Bangladesh", () => {
    expect(paymentMethodsFor("BD")).toContain("cod");
    expect(paymentMethodsFor("DE")).not.toContain("cod");
  });

  it("detects the country from browser languages", () => {
    expect(detectCountry(["en-GB", "en"])).toBe("GB");
    expect(detectCountry(["de-DE"])).toBe("DE");
    expect(detectCountry(["xx"])).toBe("US");
  });
});

describe("formatMoney", () => {
  it("formats each currency unambiguously", () => {
    expect(formatMoney(48, "USD")).toBe("$48");
    expect(formatMoney(44, "EUR")).toBe("€44");
    expect(formatMoney(38, "GBP")).toBe("£38");
    expect(formatMoney(73, "AUD")).toBe("A$73");
    expect(formatMoney(5760, "BDT")).toBe("৳5,760");
  });
});

describe("stageAt", () => {
  const placed = new Date("2026-01-01T10:00:00Z");
  const after = (min: number) => new Date(placed.getTime() + min * 60_000);

  it("advances placed → confirmed → shipped over time", () => {
    expect(stageAt(placed, after(0.5))).toBe("placed");
    expect(stageAt(placed, after(1))).toBe("confirmed");
    expect(stageAt(placed, after(5))).toBe("shipped");
  });
});
