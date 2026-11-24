import type { Product } from "../types";
import { comingSoon, products } from "./products.data";

/**
 * The catalogue seam. Everything in the app reads products through this
 * interface, so a real backend (CMS, database) can replace the mock by
 * providing another implementation here.
 */
export interface Catalog {
  list(): Promise<Product[]>;
  get(slug: string): Promise<Product | null>;
  comingSoon(): Promise<string[]>;
}

const mockCatalog: Catalog = {
  async list() {
    return products;
  },
  async get(slug) {
    return products.find((p) => p.slug === slug) ?? null;
  },
  async comingSoon() {
    return comingSoon;
  },
};

export const catalog: Catalog = mockCatalog;
