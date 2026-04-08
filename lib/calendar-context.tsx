"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarNote {
  id: string;
  date: string;
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
  addNote: (date: Date, content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
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

// Create a stable initial date for SSR (first day of current month at midnight UTC)
function getInitialDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  // Use a function to lazily initialize the date to avoid hydration mismatch
  const [currentDate, setCurrentDate] = useState(() => getInitialDate());
  const [selectedRange, setSelectedRangeState] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount (client-side only)
  useEffect(() => {
    // Set actual current date on client
    setCurrentDate(new Date());
    
    const loadFromStorage = () => {
      try {
        // Load notes
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }

        // Load selected range
        const storedRange = localStorage.getItem(STORAGE_KEYS.SELECTED_RANGE);
        if (storedRange) {
          const parsed = JSON.parse(storedRange);
          setSelectedRangeState({
            start: parsed.start ? new Date(parsed.start) : null,
            end: parsed.end ? new Date(parsed.end) : null,
          });
        }

        // Load theme - check system preference if no stored value
        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (storedTheme !== null) {
          const dark = JSON.parse(storedTheme);
          setIsDark(dark);
          document.documentElement.classList.toggle("dark", dark);
        } else {
          // Check system preference
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

  // Save notes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [notes, isHydrated]);

  // Save selected range to localStorage
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

  // Save theme to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark, isHydrated]);

  const setSelectedRange = useCallback((range: DateRange) => {
    setSelectedRangeState(range);
  }, []);

  const addNote = useCallback((date: Date, content: string) => {
    const newNote: CalendarNote = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString().split("T")[0],
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
