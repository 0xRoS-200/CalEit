"use client";

import { useMemo, useCallback } from "react";
import { useCalendar } from "@/lib/calendar-context";
import { getCalendarDays, DAY_NAMES, DAY_NAMES_SHORT } from "@/lib/calendar-utils";
import { CalendarDayComponent } from "./calendar-day";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  className?: string;
}

export function CalendarGrid({ className }: CalendarGridProps) {
  const { currentDate, selectedRange, setSelectedRange, notes } = useCalendar();

  const days = useMemo(() => {
    return getCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
  }, [currentDate]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, boolean>();
    notes.forEach((note) => {
      map.set(note.date, true);
    });
    return map;
  }, [notes]);

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        // Start new selection
        setSelectedRange({ start: date, end: null });
      } else {
        // Complete the selection
        setSelectedRange({ start: selectedRange.start, end: date });
      }
    },
    [selectedRange, setSelectedRange]
  );

  const hasNoteOnDate = useCallback(
    (date: Date) => {
      const dateString = date.toISOString().split("T")[0];
      return notesByDate.has(dateString);
    },
    [notesByDate]
  );

  // Calculate number of days in range
  const rangeDays = useMemo(() => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    const start = selectedRange.start.getTime();
    const end = selectedRange.end.getTime();
    return Math.abs(Math.ceil((end - start) / (1000 * 60 * 60 * 24))) + 1;
  }, [selectedRange]);

  return (
    <div className={cn("w-full", className)}>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1 text-muted-foreground",
              (i === 0 || i === 6) && "text-muted-foreground/60"
            )}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{DAY_NAMES_SHORT[i]}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50 mb-1" />

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => (
          <CalendarDayComponent
            key={`${day.date.toISOString()}-${index}`}
            day={day}
            selectedRange={selectedRange}
            hasNote={hasNoteOnDate(day.date)}
            onSelect={handleDaySelect}
          />
        ))}
      </div>

      {/* Selection info - compact */}
      {selectedRange.start && (
        <div className="mt-3 p-2 md:p-3 rounded-lg bg-muted/40 border border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Start date indicator - green */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-calendar-selected-start" />
                <p className="text-xs font-medium">
                  {selectedRange.start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              
              {/* End date indicator - red */}
              {selectedRange.end && (
                <>
                  <span className="text-muted-foreground text-sm">→</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-calendar-selected-end" />
                    <p className="text-xs font-medium">
                      {selectedRange.end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </>
              )}
              
              {/* Days count */}
              {rangeDays > 0 && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {rangeDays}d
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedRange({ start: null, end: null })}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
