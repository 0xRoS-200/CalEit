import { CalendarProvider } from "@/lib/calendar-context";
import { WallCalendar } from "@/components/calendar";

export default function Home() {
  return (
    <CalendarProvider>
      <WallCalendar />
    </CalendarProvider>
  );
}
