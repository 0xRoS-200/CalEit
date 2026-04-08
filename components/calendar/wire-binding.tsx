"use client";

import { cn } from "@/lib/utils";

interface WireBindingProps {
  className?: string;
}

export function WireBinding({ className }: WireBindingProps) {
  const wireCount = 17;

  return (
    <div className={cn("relative w-full h-10 flex items-center justify-center bg-muted/30", className)}>
      {/* Binding strip - the black plastic strip behind the wires */}
      <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800 rounded-sm shadow-inner" />
      
      {/* Hole punches in the paper (background) */}
      <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between px-2">
        {Array.from({ length: wireCount }).map((_, i) => (
          <div
            key={`hole-${i}`}
            className="w-2.5 h-2.5 rounded-full bg-zinc-900/80 dark:bg-zinc-950"
          />
        ))}
      </div>
      
      {/* Wire spirals */}
      <div className="relative flex items-center justify-between w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] h-full px-2">
        {Array.from({ length: wireCount }).map((_, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center"
          >
            {/* Wire spiral coil */}
            <div className="relative w-4 h-8">
              {/* Top arc of the spiral (visible above binding) */}
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 border-[2.5px] rounded-full z-20"
                style={{
                  borderColor: 'var(--calendar-wire)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                }}
              />
              {/* Spiral shadow */}
              <div 
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-4 border-2 rounded-full opacity-30 blur-[0.5px]"
                style={{
                  borderColor: 'black',
                  clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                }}
              />
              {/* Wire connection through binding */}
              <div 
                className="absolute top-3 left-1/2 -translate-x-1/2 w-[2.5px] h-4 z-10"
                style={{ backgroundColor: 'var(--calendar-wire)' }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Top paper edge shadow */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-black/5 to-transparent" />
      
      {/* Bottom shadow from the binding */}
      <div className="absolute inset-x-0 -bottom-2 h-3 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />
    </div>
  );
}
