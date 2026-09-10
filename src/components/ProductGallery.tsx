'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Amazon's gallery: a thumbnail column on the left that swaps the main image on
 * hover (not click), with the main image zooming on pointer move.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return <div className="h-96 w-full bg-gray-100" />;
  }

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex shrink-0 flex-col gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-12 w-12 overflow-hidden rounded border ${
                i === active
                  ? 'border-[#e77600] shadow-[0_0_3px_2px_rgba(228,121,17,.5)]'
                  : 'border-[#d5d9d9]'
              }`}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-contain" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-square min-w-0 flex-1 overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-contain transition-transform duration-200"
          style={
            zoom
              ? {
                  transform: 'scale(1.8)',
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
