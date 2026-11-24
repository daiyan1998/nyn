"use client";

import type { ColourId, Variant } from "@/lib/types";

/** Radio group of colour swatches. Sold-out colours are struck through. */
export function ColourSwatches({
  name,
  variants,
  value,
  onChange,
}: {
  name: string;
  variants: Variant[];
  value: ColourId;
  onChange: (c: ColourId) => void;
}) {
  return (
    <div className="swatches" role="radiogroup" aria-label="Colour">
      {variants.map((v) => {
        const soldOut = v.stock === 0;
        const id = `${name}-${v.colour}`;
        return (
          <label
            key={v.colour}
            htmlFor={id}
            className="swatch"
            data-active={value === v.colour}
            title={soldOut ? `${v.label} — sold out` : v.label}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={v.colour}
              checked={value === v.colour}
              onChange={() => onChange(v.colour)}
              className="sr-only"
            />
            <span className="dot" style={{ background: v.swatch }} />
            {soldOut && <span className="strike" aria-hidden="true" />}
            <span className="sr-only">
              {v.label}
              {soldOut ? " (sold out)" : ""}
            </span>
          </label>
        );
      })}
    </div>
  );
}
