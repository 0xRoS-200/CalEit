"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarNote {
  id: string;
  date: string;
  endDate?: string;
  content: string;
  createdAt: string;
}

interface CalendarContextType {
  currentDate: Date;
  selectedRange: DateRange;
  notes: CalendarNote[];
  isDark: boolean;
  setCurrentDate: (date: Date) => void;
  setSelectedRange: (range: DateRange) => void;
  addNote: (date: Date, content: string, endDate?: Date | null) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void;
  toggleTheme: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

const STORAGE_KEYS = {
  NOTES: "wall-calendar-notes",
  SELECTED_RANGE: "wall-calendar-range",
  THEME: "wall-calendar-theme",
};

function getInitialDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(() => getInitialDate());
  const [selectedRange, setSelectedRangeState] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
    
    const loadFromStorage = () => {
      try {
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }

        const storedRange = localStorage.getItem(STORAGE_KEYS.SELECTED_RANGE);
        if (storedRange) {
          const parsed = JSON.parse(storedRange);
          setSelectedRangeState({
            start: parsed.start ? new Date(parsed.start) : null,
            end: parsed.end ? new Date(parsed.end) : null,
          });
        }

        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (storedTheme !== null) {
          const dark = JSON.parse(storedTheme);
          setIsDark(dark);
          document.documentElement.classList.toggle("dark", dark);
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setIsDark(prefersDark);
          document.documentElement.classList.toggle("dark", prefersDark);
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
      setIsHydrated(true);
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [notes, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_RANGE,
        JSON.stringify({
          start: selectedRange.start?.toISOString() || null,
          end: selectedRange.end?.toISOString() || null,
        })
      );
    }
  }, [selectedRange, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark, isHydrated]);

  const setSelectedRange = useCallback((range: DateRange) => {
    setSelectedRangeState(range);
  }, []);

  const addNote = useCallback((date: Date, content: string, endDate?: Date | null) => {
    const newNote: CalendarNote = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString().split("T")[0],
      endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const deleteNotes = useCallback((ids: string[]) => {
    setNotes((prev) => prev.filter((note) => !ids.includes(note.id)));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        selectedRange,
        notes,
        isDark,
        setCurrentDate,
        setSelectedRange,
        addNote,
        updateNote,
        deleteNote,
        deleteNotes,
        toggleTheme,
        goToNextMonth,
        goToPrevMonth,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
