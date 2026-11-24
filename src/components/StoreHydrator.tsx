"use client";

import { useEffect } from "react";
import { useShop } from "@/store/shop";

/** Loads the persisted bag/orders from localStorage after the first render. */
export function StoreHydrator() {
  useEffect(() => {
    try {
      void useShop.persist.rehydrate();
    } catch {
      useShop.setState({ hydrated: true });
    }
  }, []);
  return null;
}
