"use client";

import "@bryntum/calendar/calendar.css";
import "@bryntum/calendar/stockholm-light.css";
import "@bryntum/calendar/fontawesome/css/fontawesome.css";
import "@bryntum/calendar/fontawesome/css/solid.css";
import { type EventModel, StringHelper } from "@bryntum/calendar";
import { BryntumCalendar } from "@bryntum/calendar-react";
import { useRouter } from "next/navigation";
import type { CalendarEvent, CalendarHours } from "./rows";

type BookingEvent = EventModel & { client?: string; detail?: string };

const hour = (time: string) => Number(time.split(":")[0]);

// Week view of the diary: paid bookings, faded unpaid holds, opening hours in white and
// closed time greyed out. Read-only: bookings change through the booking page.
export default function BookingsCalendar({
  events,
  hours,
  today,
}: {
  events: CalendarEvent[];
  hours: CalendarHours;
  today: string;
}) {
  const router = useRouter();
  const open = hours.filter((h) => h !== null);
  const dayStartTime = Math.max(Math.min(...open.map((h) => hour(h.start)), 9) - 1, 0);
  const dayEndTime = Math.min(Math.max(...open.map((h) => hour(h.end) + 1), 18) + 1, 24);
  const nonWorkingDays = Object.fromEntries(hours.map((h, day) => [day, h === null]));

  const coreHours = (date: Date) => hours[date.getDay()] ?? { start: 0, end: 0 };

  return (
    <div className="acag-calendar h-[720px] overflow-hidden rounded-card border border-line bg-surface-raised">
      <BryntumCalendar
        date={today}
        mode="week"
        readOnly
        sidebar={false}
        nonWorkingDays={nonWorkingDays}
        events={events}
        modes={{
          day: { dayStartTime, dayEndTime, coreHours },
          week: { dayStartTime, dayEndTime, coreHours },
          month: true,
          year: null,
          agenda: null,
        }}
        eventEditFeature={false}
        eventMenuFeature={false}
        scheduleMenuFeature={false}
        eventTooltipFeature={{
          showOn: "hover",
          renderer: async ({ eventRecord }: { eventRecord: BookingEvent }) =>
            `<strong>${StringHelper.encodeHtml(eventRecord.name)}</strong><br>${StringHelper.encodeHtml(
              eventRecord.detail ?? "",
            )}`,
        }}
        onEventClick={({ eventRecord }) => router.push(`/dashboard/bookings/${eventRecord.id}`)}
      />
    </div>
  );
}
