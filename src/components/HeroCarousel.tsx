'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image:
      'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=2000&q=80',
    heading: 'Shop the latest tech',
    sub: 'Deals on headphones, speakers and more',
    href: '/s?category=electronics',
  },
  {
    image:
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=2000&q=80',
    heading: 'Refresh your kitchen',
    sub: 'Everything for cooking and dining',
    href: '/s?category=home-kitchen',
  },
  {
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80',
    heading: 'New year, new deals',
    sub: 'Save across every department',
    href: '/s',
  },
  {
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=2000&q=80',
    heading: 'Books for every reader',
    sub: 'Bestsellers, new releases and more',
    href: '/s?category=books',
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);

  const next = useCallback(() => setI((n) => (n + 1) % SLIDES.length), []);
  const prev = () => setI((n) => (n - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative h-[280px] w-full overflow-hidden md:h-[420px] lg:h-[600px]">
      {SLIDES.map((s, idx) => (
        <Link
          key={s.image}
          href={s.href}
          aria-hidden={idx !== i}
          tabIndex={idx === i ? 0 : -1}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Image
            src={s.image}
            alt={s.heading}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent p-6 pt-10 md:p-12">
            <h2 className="text-2xl font-bold text-white drop-shadow md:text-4xl">
              {s.heading}
            </h2>
            <p className="mt-1 text-sm text-white/90 drop-shadow md:text-lg">
              {s.sub}
            </p>
          </div>
          {/* Amazon fades the bottom of the hero into the page background. */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#EAEDED] to-transparent" />
        </Link>
      ))}

      <button
        onClick={(e) => {
          e.preventDefault();
          prev();
        }}
        aria-label="Previous slide"
        className="absolute left-0 top-1/3 z-20 px-1 py-8 text-white/80 hover:bg-black/10 hover:text-white"
      >
        <ChevronLeft size={48} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          next();
        }}
        aria-label="Next slide"
        className="absolute right-0 top-1/3 z-20 px-1 py-8 text-white/80 hover:bg-black/10 hover:text-white"
      >
        <ChevronRight size={48} />
      </button>
    </div>
  );
}
