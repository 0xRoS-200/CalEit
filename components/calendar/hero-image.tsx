"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { MONTH_IMAGES, MONTH_NAMES } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface HeroImageProps {
  month: number;
  year: number;
  isFlipping: boolean;
  direction: "next" | "prev";
  onFlipComplete: () => void;
}

export function HeroImage({
  month,
  year,
  isFlipping,
  direction,
  onFlipComplete,
}: HeroImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef<HTMLDivElement>(null);
  const nextPageRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [displayMonth, setDisplayMonth] = useState(month);

  const currentImage = MONTH_IMAGES[displayMonth];
  const nextImage = MONTH_IMAGES[month];

  useEffect(() => {
    if (isFlipping && currentPageRef.current && nextPageRef.current && shadowRef.current) {
      const currentPage = currentPageRef.current;
      const nextPage = nextPageRef.current;
      const shadow = shadowRef.current;

      gsap.set(nextPage, {
        rotationX: direction === "next" ? -180 : 180,
        transformOrigin: direction === "next" ? "top center" : "bottom center",
        zIndex: 5,
        opacity: 1,
      });

      gsap.set(currentPage, {
        rotationX: 0,
        transformOrigin: direction === "next" ? "top center" : "bottom center",
        zIndex: 20,
        opacity: 1,
      });

      gsap.set(shadow, {
        opacity: 0,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setDisplayMonth(month);
          onFlipComplete();
          gsap.set(currentPage, { opacity: 1, rotationX: 0 });
          gsap.set(shadow, { opacity: 0 });
        },
      });

      tl.to(currentPage, {
        rotationX: direction === "next" ? 180 : -180,
        skewX: direction === "next" ? -5 : 5,
        duration: 0.8,
        ease: "power2.inOut",
        force3D: true,
      })
        .to(
          shadow,
          {
            opacity: 0.4,
            duration: 0.4,
            ease: "power2.in",
          },
          0
        )
        .to(
          shadow,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          0.4
        )
        .to(
          nextPage,
          {
            rotationX: 0,
            skewX: 0,
            duration: 0.8,
            ease: "back.out(1.2)",
            force3D: true,
          },
          0
        )
        .to(
          currentPage,
          {
            opacity: 0,
            duration: 0.1,
          },
          0.6
        );
    } else if (!isFlipping && displayMonth !== month) {
      setDisplayMonth(month);
    }
  }, [isFlipping, month, direction, onFlipComplete, displayMonth]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[2/1] overflow-hidden rounded-t-lg flex-shrink-0 bg-black"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={nextPageRef}
        className="absolute inset-0 h-full w-full"
        style={{ 
          backfaceVisibility: "hidden", 
          transformStyle: "preserve-3d",
          transformOrigin: direction === "next" ? "top center" : "bottom center"
        }}
      >
        <div className="relative w-full h-full min-h-full">
          <Image
            src={nextImage.url}
            alt={nextImage.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="backdrop-blur-md bg-black/40 px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center transform -translate-y-2">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-[0.2em] uppercase drop-shadow-2xl">
                {MONTH_NAMES[month]}
              </h2>
              <div className="h-[1px] w-12 bg-white/30 my-3" />
              <p className="text-base md:text-lg font-light text-white/90 tracking-[0.5em] uppercase drop-shadow-lg">
                {year}
              </p>
            </div>
          </div>

          <p className="absolute bottom-2 right-4 text-[10px] text-white/40 tracking-widest uppercase">
            {nextImage.credit}
          </p>
        </div>
      </div>

      <div
        ref={currentPageRef}
        className={cn(
          "absolute inset-0 h-full w-full",
          isFlipping ? "pointer-events-none" : ""
        )}
        style={{ 
          backfaceVisibility: "hidden", 
          transformStyle: "preserve-3d",
          transformOrigin: direction === "next" ? "top center" : "bottom center"
        }}
      >
        <div className="relative w-full h-full min-h-full">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="backdrop-blur-md bg-black/40 px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center transform -translate-y-2">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-[0.2em] uppercase drop-shadow-2xl">
                {MONTH_NAMES[displayMonth]}
              </h2>
              <div className="h-[1px] w-12 bg-white/30 my-3" />
              <p className="text-base md:text-lg font-light text-white/90 tracking-[0.5em] uppercase drop-shadow-lg">
                {year}
              </p>
            </div>
          </div>

          <p className="absolute bottom-2 right-4 text-[10px] text-white/40 tracking-widest uppercase">
            {currentImage.credit}
          </p>
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/20 to-transparent" />
        </div>
      </div>

      <div
        ref={shadowRef}
        className="absolute inset-0 bg-black/40 pointer-events-none"
        style={{ opacity: 0 }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {!isFlipping && (
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
