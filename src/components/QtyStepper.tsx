"use client";

export function QtyStepper({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (q: number) => void;
}) {
  const btn =
    "grid h-8 w-8 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-30";
  return (
    <div className="inline-flex items-center border border-line font-mono text-[12px]">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        aria-label={`Decrease quantity of ${label}`}
      >
        −
      </button>
      <span className="w-8 text-center" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  );
}
