"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  tag,
}: {
  images: ProductImage[];
  tag: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="product-media relative aspect-[4/5] w-full">
        <span className="tag">{tag}</span>
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 860px) 100vw, 55vw"
          quality={85}
          loading="eager"
          fetchPriority="high"
          className="animate-[fade_.5s_ease]"
        />
      </div>
      <div className="grid grid-cols-3 gap-3" role="group" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={i === active}
            className={`relative aspect-[4/3] overflow-hidden bg-panel transition-opacity ${
              i === active
                ? "outline outline-1 outline-offset-2 outline-brass-bright"
                : "opacity-55 hover:opacity-100"
            }`}
          >
            <Image src={img.src} alt="" fill sizes="20vw" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
