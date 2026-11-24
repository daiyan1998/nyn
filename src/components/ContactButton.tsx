"use client";

import { useEffect, useRef, useState } from "react";
import { shopConfig } from "@/lib/config";
import { useShop } from "@/store/shop";

/** What the visitor is looking at, used to pre-fill the message. */
function context() {
  const h1 = document.querySelector("main h1")?.textContent?.trim();
  const path = window.location.pathname;
  if (path.startsWith("/products/") && h1) return `I have a question about ${h1}.`;
  if (path.startsWith("/orders/")) {
    return `I have a question about my order ${path.split("/").pop()}.`;
  }
  if (path.startsWith("/checkout")) return "I have a question before I check out.";
  return "I have a question.";
}

/** Floating "Ask us" button: WhatsApp or email, pre-filled with page context. */
export function ContactButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Get out of the way while the menu or bag is open.
  const covered = useShop((s) => s.menuOpen || s.drawerOpen);
  const raised = useShop((s) => s.stickyBar);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (channel: "whatsapp" | "email") => {
    const text = `Hi Tennor & Co. — ${context()}`;
    const url =
      channel === "whatsapp"
        ? `https://wa.me/${shopConfig.whatsapp}?text=${encodeURIComponent(text)}`
        : `mailto:${shopConfig.email}?subject=${encodeURIComponent("Question")}&body=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
    setOpen(false);
  };

  if (covered) return null;

  return (
    <div ref={ref} className={`fixed right-5 z-[150] transition-[bottom] duration-300 ${raised ? "bottom-5 max-sm:bottom-[84px]" : "bottom-5"} flex flex-col items-end gap-3`}>
      {open && (
        <div
          role="menu"
          aria-label="Contact options"
          className="w-[260px] border border-line bg-ink-2 p-5 shadow-2xl"
        >
          <p className="mb-1 font-serif text-xl">Questions? Ask the maker.</p>
          <p className="mb-4 text-[13px] leading-relaxed text-bone-dim">
            Sizing, colours, shipping to your country — we usually reply within a
            few hours.
          </p>
          <div className="flex flex-col gap-2">
            <button type="button" role="menuitem" className="btn w-full! self-stretch!" onClick={() => go("whatsapp")}>
              <span>WhatsApp us</span>
            </button>
            <button type="button" role="menuitem" className="btn btn-ghost w-full! self-stretch!" onClick={() => go("email")}>
              <span>Email us</span>
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-brass bg-ink px-5 py-3 font-mono text-[11px] tracking-[.14em] text-brass-bright uppercase shadow-xl transition-colors hover:bg-brass hover:text-ink"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#5fbf7a]" />
        {open ? "Close" : "Ask us"}
      </button>
    </div>
  );
}
