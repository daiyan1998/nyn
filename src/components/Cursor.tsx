"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, .btn, select, label[for]";

/** Brass dot that follows the pointer and grows over interactive elements. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover:hover)").matches) return;

    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };
    // Delegated, so elements rendered later (drawer, toasts) also grow the cursor.
    const over = (e: MouseEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      el.classList.toggle("grow", Boolean(hit));
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
    };
  }, []);

  return <div id="cursor" ref={ref} aria-hidden="true" />;
}
