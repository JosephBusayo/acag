import type { bookings, OpeningHours } from "@/server/db/schema";
import { balanceOf, clockTime, dayKey } from "../format";

type Booking = typeof bookings.$inferSelect;

// Plain, serialisable rows for the client-side grid and calendar. Times are converted to the
// salon's own wall clock here, so the stylist sees salon time whatever timezone their browser is in.

export type GridRow = {
  id: string;
  reference: string;
  day: string; // yyyy-mm-dd in the salon's timezone
  time: string;
  startsAt: number;
  client: string;
  style: string;
  lengthInches: number | null;
  plan: string;
  price: number;
  paid: number;
  balance: number;
  status: Booking["status"];
};

const planLabel = (b: Booking) =>
  b.paymentPlan === "full" || balanceOf(b) === 0 ? "Paid in full" : "Deposit";

export function toGridRow(b: Booking, timeZone: string): GridRow {
  return {
    id: b.id,
    reference: b.reference,
    day: dayKey(b.startsAt, timeZone),
    time: clockTime(b.startsAt, timeZone),
    startsAt: b.startsAt.getTime(),
    client: b.clientName || "Client",
    style: b.styleNameSnapshot,
    lengthInches: b.lengthInches,
    plan: b.paymentStatus === "paid" ? planLabel(b) : "Unpaid",
    price: b.priceCents / 100,
    paid: b.amountPaidCents / 100,
    balance: b.status === "confirmed" ? balanceOf(b) / 100 : 0,
    status: b.status,
  };
}

// "2026-11-07T14:00:00" in the salon's timezone, with no offset, so the calendar draws it as is.
const wallClock = (date: Date, timeZone: string) =>
  date.toLocaleString("sv-SE", { timeZone, hour12: false }).replace(" ", "T");

export type CalendarEvent = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  eventColor: string;
  cls: string;
  client: string;
  detail: string;
};

const colours: Record<Booking["status"], string> = {
  confirmed: "orange",
  completed: "green",
  no_show: "red",
  held: "gray",
  cancelled: "gray",
};

export function toCalendarEvent(b: Booking, timeZone: string): CalendarEvent {
  const held = b.status === "held";
  const balance = balanceOf(b);
  return {
    id: b.id,
    name: `${b.clientName || "Client"} · ${b.styleNameSnapshot}${b.lengthInches ? `, ${b.lengthInches} in` : ""}`,
    startDate: wallClock(b.startsAt, timeZone),
    endDate: wallClock(b.endsAt, timeZone),
    eventColor: colours[b.status],
    cls: held ? "acag-held" : "",
    client: b.clientName || "Client",
    detail: held
      ? "Held, waiting for payment"
      : b.status === "confirmed" && balance > 0
        ? `$${(balance / 100).toFixed(2)} due at the appointment`
        : b.status === "confirmed"
          ? "Paid in full"
          : b.status === "no_show"
            ? "No-show"
            : "Completed",
  };
}

export type CalendarHours = (null | { start: string; end: string })[];

// Opening hours as a Sunday-first array, as the calendar expects.
export const calendarHours = (hours: OpeningHours): CalendarHours =>
  ["0", "1", "2", "3", "4", "5", "6"].map((d) => {
    const h = hours[d];
    return h ? { start: h.open, end: h.close } : null;
  });
