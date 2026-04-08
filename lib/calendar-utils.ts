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

  const remainingDays = 42 - days.length;
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

export const MONTH_IMAGES: Record<number, { url: string; alt: string; credit: string }> = {
  0: {
    url: "/images/hollow-knight/jan.png",
    alt: "Hollow Knight - The Knight",
    credit: "Generated Content",
  },
  1: {
    url: "/images/hollow-knight/feb.png",
    alt: "Hollow Knight - Dirtmouth",
    credit: "Generated Content",
  },
  2: {
    url: "/images/hollow-knight/mar.png",
    alt: "Hollow Knight - Greenpath",
    credit: "Generated Content",
  },
  3: {
    url: "/images/hollow-knight/apr.png",
    alt: "Hollow Knight - City of Tears",
    credit: "Generated Content",
  },
  4: {
    url: "/images/hollow-knight/may.png",
    alt: "Hollow Knight - Crystal Peak",
    credit: "Generated Content",
  },
  5: {
    url: "/images/hollow-knight/jun.png",
    alt: "Hollow Knight - Resting Grounds",
    credit: "Generated Content",
  },
  6: {
    url: "/images/hollow-knight/jul.png",
    alt: "Hollow Knight - Deepnest",
    credit: "Generated Content",
  },
  7: {
    url: "/images/hollow-knight/aug.png",
    alt: "Hollow Knight - Kingdom's Edge",
    credit: "Generated Content",
  },
  8: {
    url: "/images/hollow-knight/sep.png",
    alt: "Hollow Knight - Ancient Basin",
    credit: "Generated Content",
  },
  9: {
    url: "/images/hollow-knight/oct.png",
    alt: "Hollow Knight - The Abyss",
    credit: "Generated Content",
  },
  10: {
    url: "/images/hollow-knight/nov.png",
    alt: "Hollow Knight - Pantheon",
    credit: "Generated Content",
  },
  11: {
    url: "/images/hollow-knight/dec.png",
    alt: "Hollow Knight - Final Challenge",
    credit: "Generated Content",
  },
};
