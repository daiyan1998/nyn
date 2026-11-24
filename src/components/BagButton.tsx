"use client";

import { itemCount } from "@/lib/cart";
import { useShop } from "@/store/shop";

export function BagButton() {
  const count = useShop((s) => itemCount(s.lines));
  const open = useShop((s) => s.openDrawer);
  return (
    <button
      type="button"
      className="nav-bag"
      onClick={() => open("bag")}
      aria-haspopup="dialog"
      aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
    >
      Bag ({count})
    </button>
  );
}
