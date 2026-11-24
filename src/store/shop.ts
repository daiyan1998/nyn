"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addLine, setQuantity } from "@/lib/cart";
import { detectCountry, findCountry } from "@/lib/config";
import type { CustomerInput } from "@/lib/checkout-schema";
import type { CartLine, CurrencyCode, Order } from "@/lib/types";

type Toast = { id: number; message: string; tone: "ok" | "error" };

export type CheckoutDraft = Partial<Record<keyof CustomerInput, string>>;

type ShopState = {
  // persisted
  lines: CartLine[];
  orders: Order[];
  subscribers: string[];
  /** Display currency. null until detected on first visit. */
  currency: CurrencyCode | null;
  /** Shipping destination (ISO code). null until detected on first visit. */
  country: string | null;
  /** Checkout fields, saved as the customer types (and remembered for next time). */
  draft: CheckoutDraft;
  rememberDetails: boolean;

  // session-only UI
  hydrated: boolean;
  drawerOpen: boolean;
  drawerTab: "bag" | "orders";
  menuOpen: boolean;
  /** A mobile sticky buy bar is showing at the bottom of the screen. */
  stickyBar: boolean;
  toasts: Toast[];

  add: (line: CartLine) => void;
  setQty: (key: string, quantity: number) => void;
  clearBag: () => void;
  recordOrder: (order: Order) => void;
  addSubscriber: (email: string) => void;
  setCurrency: (c: CurrencyCode) => void;
  setCountry: (code: string) => void;
  setDraft: (patch: CheckoutDraft) => void;
  setRememberDetails: (v: boolean) => void;
  openDrawer: (tab?: "bag" | "orders") => void;
  closeDrawer: () => void;
  setMenuOpen: (v: boolean) => void;
  setStickyBar: (v: boolean) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      lines: [],
      orders: [],
      subscribers: [],
      currency: null,
      country: null,
      draft: {},
      rememberDetails: true,
      hydrated: false,
      drawerOpen: false,
      drawerTab: "bag",
      menuOpen: false,
      stickyBar: false,
      toasts: [],

      add: (line) => set((s) => ({ lines: addLine(s.lines, line) })),
      setQty: (key, quantity) =>
        set((s) => ({ lines: setQuantity(s.lines, key, quantity) })),
      clearBag: () => set({ lines: [] }),
      recordOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      addSubscriber: (email) =>
        set((s) => ({ subscribers: [...s.subscribers, email.toLowerCase()] })),
      setCurrency: (currency) => set({ currency }),
      setCountry: (country) =>
        set((s) => ({ country, draft: { ...s.draft, country } })),
      setDraft: (patch) =>
        set((s) => ({
          draft: { ...s.draft, ...patch },
          country: patch.country ?? s.country,
        })),
      setRememberDetails: (rememberDetails) => set({ rememberDetails }),
      openDrawer: (tab = "bag") =>
        set({ drawerOpen: true, drawerTab: tab, menuOpen: false }),
      closeDrawer: () => set({ drawerOpen: false }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      setStickyBar: (stickyBar) => set({ stickyBar }),
      toast: (message, tone = "ok") => {
        const id = ++toastId;
        set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
        setTimeout(
          () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
          3600,
        );
      },
      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "tennor-shop",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lines: s.lines,
        orders: s.orders,
        subscribers: s.subscribers,
        currency: s.currency,
        country: s.country,
        draft: s.rememberDetails ? s.draft : {},
        rememberDetails: s.rememberDetails,
      }),
      // v1 stored BDT prices and domestic orders; start fresh.
      migrate: () => ({}),
      // Rehydrated manually after mount to avoid SSR hydration mismatches.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        const s = useShop.getState();
        // First visit: guess country and currency from the browser.
        const country =
          s.country ?? detectCountry(navigator.languages ?? [navigator.language]);
        const currency = s.currency ?? findCountry(country)?.currency ?? "USD";
        useShop.setState({ hydrated: true, country, currency });
      },
    },
  ),
);

/** Display currency, falling back to USD before hydration (matches SSR). */
export const useCurrency = (): CurrencyCode =>
  useShop((s) => (s.hydrated && s.currency) || "USD");

/** Shipping country, falling back to the default before hydration. */
export const useCountry = (): string =>
  useShop((s) => (s.hydrated && s.country) || "US");
