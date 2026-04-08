export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const days: CalendarDay[] = [];

  // Previous month days
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: dateString === todayString,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
}

export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isDateInRange(
  date: Date,
  start: Date | null,
  end: Date | null
): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  return time >= Math.min(startTime, endTime) && time <= Math.max(startTime, endTime);
}

export function isStartOfRange(
  date: Date,
  start: Date | null,
  end: Date | null
): boolean {
  if (!start) return false;
  if (!end) return isSameDay(date, start);
  return isSameDay(date, start.getTime() <= end.getTime() ? start : end);
}

export function isEndOfRange(
  date: Date,
  start: Date | null,
  end: Date | null
): boolean {
  if (!start || !end) return false;
  return isSameDay(date, start.getTime() <= end.getTime() ? end : start);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// Month images - landscape photography for each month
export const MONTH_IMAGES: Record<number, { url: string; alt: string; credit: string }> = {
  0: {
    url: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1200&h=800&fit=crop",
    alt: "Winter mountain landscape",
    credit: "Photo by Unsplash",
  },
  1: {
    url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200&h=800&fit=crop",
    alt: "Snowy forest path",
    credit: "Photo by Unsplash",
  },
  2: {
    url: "https://images.unsplash.com/photo-1462275646964-a0e3571f4f0f?w=1200&h=800&fit=crop",
    alt: "Spring cherry blossoms",
    credit: "Photo by Unsplash",
  },
  3: {
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=800&fit=crop",
    alt: "Spring flower field",
    credit: "Photo by Unsplash",
  },
  4: {
    url: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=1200&h=800&fit=crop",
    alt: "May meadow sunrise",
    credit: "Photo by Unsplash",
  },
  5: {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop",
    alt: "Summer beach sunset",
    credit: "Photo by Unsplash",
  },
  6: {
    url: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&h=800&fit=crop",
    alt: "Lavender fields",
    credit: "Photo by Unsplash",
  },
  7: {
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&h=800&fit=crop",
    alt: "Golden wheat field",
    credit: "Photo by Unsplash",
  },
  8: {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
    alt: "Early autumn forest",
    credit: "Photo by Unsplash",
  },
  9: {
    url: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&h=800&fit=crop",
    alt: "Autumn leaves landscape",
    credit: "Photo by Unsplash",
  },
  10: {
    url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&h=800&fit=crop",
    alt: "Misty autumn morning",
    credit: "Photo by Unsplash",
  },
  11: {
    url: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&h=800&fit=crop",
    alt: "Winter wonderland",
    credit: "Photo by Unsplash",
  },
};
