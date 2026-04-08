"use client";

import { useRef, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  CalendarDay as CalendarDayType,
  isSameDay,
  isDateInRange,
  isStartOfRange,
  isEndOfRange,
} from "@/lib/calendar-utils";
import { DateRange, CalendarNote } from "@/lib/calendar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarDayProps {
  day: CalendarDayType;
  selectedRange: DateRange;
  notes: CalendarNote[];
  eventInfo?: { isInRange: boolean; isStart: boolean; isEnd: boolean; content: string; id: string } | null;
  onSelect: (date: Date) => void;
  onDeleteNote?: (id: string) => void;
}

export function CalendarDayComponent({
  day,
  selectedRange,
  notes,
  eventInfo,
  onSelect,
  onDeleteNote,
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

    gsap.killTweensOf(dayRef.current);
    gsap.killTweensOf(numberRef.current);

    const tl = gsap.timeline();

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

  const allNotes = useMemo(() => {
    const combined = [...notes];
    if (eventInfo?.isInRange && !notes.some(n => n.content === eventInfo.content)) {
      combined.push({
        id: "event-proxy",
        date: day.date.toISOString(),
        content: `Event: ${eventInfo.content}`,
        createdAt: ""
      });
    }
    return combined;
  }, [notes, eventInfo, day.date]);

  const hasNote = allNotes.length > 0;

  const content = (
    <button
      ref={dayRef}
      onClick={handleClick}
      disabled={!day.isCurrentMonth}
      className={cn(
        "relative flex flex-col items-center justify-center p-1 md:p-2 min-h-[44px] md:min-h-[56px] w-full aspect-square rounded-lg transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !day.isCurrentMonth && "opacity-25 cursor-default pointer-events-none",
        isSelected && "hover:bg-muted/80 cursor-pointer active:scale-95",
        day.isWeekend && day.isCurrentMonth && !isSelected && !isInRange && "text-muted-foreground/80",
        
        eventInfo?.isInRange && !isSelected && !isInRange && "bg-primary/10",
        eventInfo?.isStart && !isSelected && !isInRange && "rounded-l-lg border-l-4 border-primary ring-1 ring-primary/20 bg-primary/20",
        eventInfo?.isEnd && !isSelected && !isInRange && "rounded-r-lg border-r-4 border-primary ring-1 ring-primary/20 bg-primary/20",

        isInRange &&
          !isRangeStart &&
          !isRangeEnd &&
          "bg-calendar-selected-range rounded-none text-foreground",
        isRangeStart &&
          isRangeEnd &&
          "bg-calendar-selected-start text-white rounded-lg shadow-xl scale-110 ring-2 ring-primary ring-offset-2 z-10",
        isRangeStart &&
          !isRangeEnd &&
          selectedRange.end &&
          "bg-calendar-selected-start text-white rounded-l-lg rounded-r-none scale-105 ring-2 ring-primary ring-offset-2 z-10",
        isRangeStart &&
          !isRangeEnd &&
          !selectedRange.end &&
          "bg-calendar-selected-start text-white rounded-lg shadow-md scale-110 ring-2 ring-primary ring-offset-2 z-10",
        isRangeEnd &&
          !isRangeStart &&
          "bg-calendar-selected-end text-white rounded-r-lg rounded-l-none scale-105 ring-2 ring-destructive ring-offset-2 z-10",
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
      {hasNote && day.isCurrentMonth && (
        <span 
          className={cn(
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
            isSelected ? "bg-white/80" : "bg-primary"
          )} 
        />
      )}
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

  if (hasNote && day.isCurrentMonth) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent 
            className="p-3 max-w-[200px] bg-background/95 backdrop-blur-md border-primary/20 shadow-xl"
            side="top"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Notes</p>
              {allNotes.map((note) => (
                <p key={note.id} className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  • {note.content}
                </p>
              ))}

              {eventInfo?.isInRange && eventInfo.id && onDeleteNote && (
                <div className="pt-2 mt-2 border-t border-border flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(eventInfo.id);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded transition-colors uppercase tracking-widest"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Event
                  </button>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
