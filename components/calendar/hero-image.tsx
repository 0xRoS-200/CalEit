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

      // Set initial state for pages
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

      // Create the page flip animation with realistic paper curl
      const tl = gsap.timeline({
        onComplete: () => {
          setDisplayMonth(month);
          onFlipComplete();
          gsap.set(currentPage, { opacity: 1, rotationX: 0 });
          gsap.set(shadow, { opacity: 0 });
        },
      });

      // Animate current page lifting and flipping
      tl.to(currentPage, {
        rotationX: direction === "next" ? 180 : -180,
        duration: 0.8,
        ease: "power2.inOut",
      })
        // Animate shadow growing as page lifts
        .to(
          shadow,
          {
            opacity: 0.3,
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
        // Bring next page into view
        .to(
          nextPage,
          {
            rotationX: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          0
        )
        // Fade out current page as it completes flip
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
      className="relative w-full aspect-[16/10] overflow-hidden rounded-t-lg"
      style={{ perspective: "1200px" }}
    >
      {/* Next page (underneath) - shown during flip */}
      <div
        ref={nextPageRef}
        className="absolute inset-0"
        style={{ 
          backfaceVisibility: "hidden", 
          transformStyle: "preserve-3d",
          transformOrigin: direction === "next" ? "top center" : "bottom center"
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src={nextImage.url}
            alt={nextImage.alt}
            fill
            className="object-cover"
            priority
          />
          {/* Month overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">
              {MONTH_NAMES[month]}
            </h2>
            <p className="text-sm md:text-base text-white/80 drop-shadow-md">
              {year}
            </p>
          </div>
          {/* Photo credit */}
          <p className="absolute bottom-2 right-2 text-xs text-white/60">
            {nextImage.credit}
          </p>
        </div>
      </div>

      {/* Current page (on top) */}
      <div
        ref={currentPageRef}
        className={cn(
          "absolute inset-0",
          isFlipping ? "pointer-events-none" : ""
        )}
        style={{ 
          backfaceVisibility: "hidden", 
          transformStyle: "preserve-3d",
          transformOrigin: direction === "next" ? "top center" : "bottom center"
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            className="object-cover"
            priority
          />
          {/* Month overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">
              {MONTH_NAMES[displayMonth]}
            </h2>
            <p className="text-sm md:text-base text-white/80 drop-shadow-md">
              {year}
            </p>
          </div>
          {/* Photo credit */}
          <p className="absolute bottom-2 right-2 text-xs text-white/60">
            {currentImage.credit}
          </p>
          {/* Paper edge effect */}
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/10 to-transparent" />
        </div>
      </div>

      {/* Dynamic shadow during flip */}
      <div
        ref={shadowRef}
        className="absolute inset-0 bg-black/30 pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Page fold shadow hint */}
      {!isFlipping && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
