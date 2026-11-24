"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { shopConfig } from "@/lib/config";
import { useShop } from "@/store/shop";
import { CurrencySelect } from "./CurrencySelect";

const links = [
  { href: "/#shop", label: "Shop all" },
  { href: "/#parallax", label: "Craft" },
  { href: "/#materials", label: "Materials" },
  { href: "/#quote", label: "Journal" },
  { href: "/#cta", label: "Contact" },
];

/** "Menu" toggle, shown only on small screens (the inline nav is hidden there). */
export function MenuButton() {
  const open = useShop((s) => s.menuOpen);
  const setOpen = useShop((s) => s.setMenuOpen);
  return (
    <button
      type="button"
      className="nav-bag menu-toggle"
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={() => setOpen(!open)}
    >
      {open ? "Close" : "Menu"}
    </button>
  );
}

export function MobileMenuPanel() {
  const open = useShop((s) => s.menuOpen);
  const setOpen = useShop((s) => s.setMenuOpen);
  const openDrawer = useShop((s) => s.openDrawer);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div
      id="mobile-menu"
      inert={!open}
      className={`fixed inset-0 z-[90] flex flex-col justify-between bg-ink px-[22px] pt-28 pb-10 transition-[opacity,visibility] duration-300 min-[761px]:hidden ${
        open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
      }`}
    >
      <nav aria-label="Mobile">
        <ul className="flex flex-col gap-2">
          {links.map((l, i) => (
            <li key={l.href}>
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-1 font-serif text-[44px] leading-tight"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => openDrawer("orders")}
              className="py-1 font-serif text-[44px] leading-tight text-bone-dim"
            >
              My orders
            </button>
          </li>
        </ul>
      </nav>
      <div className="flex flex-col gap-5 border-t border-line pt-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Currency</span>
          <CurrencySelect />
        </div>
        <p className="text-[13px] leading-relaxed text-bone-dim">
          Handmade in Dhaka · Ships worldwide ·{" "}
          <a href={`mailto:${shopConfig.email}`} className="underline underline-offset-4">
            {shopConfig.email}
          </a>
        </p>
      </div>
    </div>
  );
}
