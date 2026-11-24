"use client";

import { useShop } from "@/store/shop";

export function Toasts() {
  const toasts = useShop((s) => s.toasts);
  const dismiss = useShop((s) => s.dismissToast);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[300] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto border px-5 py-4 text-left font-mono text-[11px] tracking-[.12em] uppercase shadow-2xl ${
            t.tone === "error"
              ? "border-rust bg-rust text-bone"
              : "border-brass bg-ink text-brass-bright"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
