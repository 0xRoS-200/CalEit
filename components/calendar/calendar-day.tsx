"use client";

import { useRef, useCallback } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  CalendarDay as CalendarDayType,
  isSameDay,
  isDateInRange,
  isStartOfRange,
  isEndOfRange,
} from "@/lib/calendar-utils";
import { DateRange } from "@/lib/calendar-context";

interface CalendarDayProps {
  day: CalendarDayType;
  selectedRange: DateRange;
  hasNote: boolean;
  onSelect: (date: Date) => void;
}

export function CalendarDayComponent({
  day,
  selectedRange,
  hasNote,
  onSelect,
}: CalendarDayProps) {
  const dayRef = useRef<HTMLButtonElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const isSelected =
    isSameDay(day.date, selectedRange.start) ||
    isSameDay(day.date, selectedRange.end);
  const isInRange = isDateInRange(
    day.date,
    selectedRange.start,
    selectedRange.end
  );
  const isRangeStart = isStartOfRange(
    day.date,
    selectedRange.start,
    selectedRange.end
  );
  const isRangeEnd = isEndOfRange(
    day.date,
    selectedRange.start,
    selectedRange.end
  );

  const handleClick = useCallback(() => {
    if (!dayRef.current || !numberRef.current) return;

    // Kill any existing animations
    gsap.killTweensOf(dayRef.current);
    gsap.killTweensOf(numberRef.current);

    // Create shake + zoom animation sequence
    const tl = gsap.timeline();

    // Rapid shake animation
    tl.to(dayRef.current, {
      x: -4,
      duration: 0.04,
      ease: "power2.inOut",
    })
      .to(dayRef.current, {
        x: 4,
        duration: 0.04,
        ease: "power2.inOut",
      })
      .to(dayRef.current, {
        x: -3,
        duration: 0.04,
        ease: "power2.inOut",
      })
      .to(dayRef.current, {
        x: 3,
        duration: 0.04,
        ease: "power2.inOut",
      })
      .to(dayRef.current, {
        x: -1,
        duration: 0.03,
        ease: "power2.inOut",
      })
      .to(dayRef.current, {
        x: 0,
        duration: 0.03,
        ease: "power2.out",
      })
      // Zoom in effect on the number with a bounce
      .to(
        numberRef.current,
        {
          scale: 1.4,
          duration: 0.12,
          ease: "back.out(3)",
        },
        "-=0.08"
      )
      .to(numberRef.current, {
        scale: 1,
        duration: 0.25,
        ease: "elastic.out(1, 0.5)",
      });

    onSelect(day.date);
  }, [day.date, onSelect]);

  return (
    <button
      ref={dayRef}
      onClick={handleClick}
      disabled={!day.isCurrentMonth}
      className={cn(
        "relative flex flex-col items-center justify-center p-1 md:p-2 min-h-[44px] md:min-h-[56px] rounded-lg transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Default state
        !day.isCurrentMonth && "opacity-25 cursor-default pointer-events-none",
        day.isCurrentMonth && "hover:bg-muted/80 cursor-pointer active:scale-95",
        day.isWeekend && day.isCurrentMonth && !isSelected && !isInRange && "text-muted-foreground/80",
        // Range styling - green for start, red for end
        isInRange &&
          !isRangeStart &&
          !isRangeEnd &&
          "bg-calendar-selected-range rounded-none text-foreground",
        isRangeStart &&
          isRangeEnd &&
          "bg-calendar-selected-start text-white rounded-lg shadow-md",
        isRangeStart &&
          !isRangeEnd &&
          selectedRange.end &&
          "bg-calendar-selected-start text-white rounded-l-lg rounded-r-none",
        isRangeStart &&
          !isRangeEnd &&
          !selectedRange.end &&
          "bg-calendar-selected-start text-white rounded-lg shadow-md",
        isRangeEnd &&
          !isRangeStart &&
          "bg-calendar-selected-end text-white rounded-r-lg rounded-l-none",
        // Today indicator
        day.isToday &&
          !isSelected &&
          "ring-2 ring-calendar-today ring-inset font-semibold"
      )}
    >
      <span
        ref={numberRef}
        className={cn(
          "text-sm md:text-base font-medium inline-block will-change-transform",
          isSelected && "font-bold",
          day.isToday && !isSelected && "font-semibold"
        )}
      >
        {day.dayOfMonth}
      </span>
      {/* Note indicator */}
      {hasNote && day.isCurrentMonth && (
        <span 
          className={cn(
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
            isSelected ? "bg-white/80" : "bg-accent"
          )} 
        />
      )}
      {/* Today text label */}
      {day.isToday && (
        <span className={cn(
          "absolute -bottom-0.5 text-[8px] font-medium uppercase tracking-wider",
          isSelected ? "text-white/70" : "text-calendar-today"
        )}>
          today
        </span>
      )}
    </button>
  );
}
