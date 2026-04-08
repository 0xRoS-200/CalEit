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
  const { currentDate, selectedRange, setSelectedRange, notes, addNote, deleteNote } = useCalendar();

  const days = useMemo(() => {
    return getCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
  }, [currentDate]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, typeof notes>();
    notes.forEach((note) => {
      const existing = map.get(note.date) || [];
      map.set(note.date, [...existing, note]);
    });
    return map;
  }, [notes]);

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        setSelectedRange({ start: date, end: null });
      } else {
        const start = selectedRange.start;
        const end = date;
        if (end < start) {
          setSelectedRange({ start: end, end: start });
        } else {
          setSelectedRange({ start: start, end: end });
        }
      }
    },
    [selectedRange, setSelectedRange]
  );

  const getNotesForDate = useCallback(
    (date: Date) => {
      const dateString = date.toISOString().split("T")[0];
      return notesByDate.get(dateString) || [];
    },
    [notesByDate]
  );

  const rangeDays = useMemo(() => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    const start = selectedRange.start.getTime();
    const end = selectedRange.end.getTime();
    return Math.abs(Math.ceil((end - start) / (1000 * 60 * 60 * 24))) + 1;
  }, [selectedRange]);

  const rangeEvents = useMemo(() => {
    return notes.filter(n => n.endDate);
  }, [notes]);

  const getEventInfo = useCallback((date: Date) => {
    const time = date.getTime();
    const dateStr = date.toISOString().split('T')[0];
    
    for (const event of rangeEvents) {
      const start = new Date(event.date + "T00:00:00").getTime();
      const end = new Date(event.endDate! + "T00:00:00").getTime();
      
      if (time >= start && time <= end) {
          return {
            isInRange: true,
            isStart: dateStr === event.date,
            isEnd: dateStr === event.endDate,
            content: event.content,
            id: event.id
          };
      }
    }
    return null;
  }, [rangeEvents]);

  return (
    <div className={cn("w-full", className)}>
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

      <div className="h-px bg-border/50 mb-1" />

      <div className="flex flex-col gap-0.5">
        {useMemo(() => {
          const blocks = [];
          for (let i = 0; i < days.length; i += 7) {
            blocks.push(days.slice(i, i + 7));
          }
          return blocks;
        }, [days]).map((week, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            className="grid grid-cols-7 gap-0.5 rounded-lg p-0.5"
          >
            {week.map((day, dayIndex) => {
              const dayNotes = getNotesForDate(day.date);
              return (
                <CalendarDayComponent
                  key={`${day.date.toISOString()}-${rowIndex}-${dayIndex}`}
                  day={day}
                  selectedRange={selectedRange}
                  notes={dayNotes}
                  eventInfo={getEventInfo(day.date)}
                  onSelect={handleDaySelect}
                  onDeleteNote={deleteNote}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedRange.start && (
        <div className="mt-3 p-2 md:p-3 rounded-lg bg-muted/40 border border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-calendar-selected-start" />
                <p className="text-xs font-medium">
                  {selectedRange.start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              
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
