import { and, asc, desc, eq, gt, gte, inArray, lt, or } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { BookingsList } from "../bookings-list";
import { dayKey } from "../format";
import { BookingsGrid } from "./bookings-grid";
import { CalendarView } from "./calendar-view";
import { calendarHours, toCalendarEvent, toGridRow } from "./rows";

const views = { upcoming: "Upcoming", past: "Past", calendar: "Calendar", table: "Table" } as const;
type View = keyof typeof views;

const isView = (value: unknown): value is View => typeof value === "string" && value in views;

export default async function BookingsPage({ searchParams }: PageProps<"/dashboard/bookings">) {
  const shop = await requireSellerShop();
  const requested = (await searchParams).show;
  const current: View = isView(requested) ? requested : "upcoming";
  const now = new Date();
  const ofShop = eq(bookings.shopId, shop.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bookings"
        title={
          <>
            Your diary, <em className="font-normal text-ink-3">paid up front.</em>
          </>
        }
      />
      <nav aria-label="Booking views" className="flex gap-1 overflow-x-auto rounded-card bg-surface p-1">
        {(Object.keys(views) as View[]).map((key) => (
          <Link
            key={key}
            href={key === "upcoming" ? "/dashboard/bookings" : `/dashboard/bookings?show=${key}`}
            aria-current={key === current ? "page" : undefined}
            className={`flex min-h-10 shrink-0 items-center rounded-chip px-4 text-sm ${
              key === current ? "bg-surface-raised font-medium shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {views[key]}
          </Link>
        ))}
      </nav>
      {current === "upcoming" && (
        // Only paid bookings are in the diary. Unpaid holds never block the stylist's day.
        <BookingsList
          items={await db
            .select()
            .from(bookings)
            .where(and(ofShop, eq(bookings.status, "confirmed"), gte(bookings.endsAt, now)))
            .orderBy(asc(bookings.startsAt))}
          timeZone={shop.timezone}
          empty="No upcoming bookings. Share your booking link."
        />
      )}
      {current === "past" && (
        <BookingsList
          items={await db
            .select()
            .from(bookings)
            .where(
              and(
                ofShop,
                or(
                  inArray(bookings.status, ["completed", "no_show"]),
                  and(eq(bookings.status, "confirmed"), lt(bookings.endsAt, now)),
                ),
              ),
            )
            .orderBy(desc(bookings.startsAt))
            .limit(100)}
          timeZone={shop.timezone}
          empty="No past bookings yet."
        />
      )}
      {current === "calendar" && (
        <div className="space-y-3">
          <CalendarView
            today={dayKey(now, shop.timezone)}
            hours={calendarHours(shop.openingHours)}
            events={(
              await db
                .select()
                .from(bookings)
                .where(
                  and(
                    ofShop,
                    or(
                      inArray(bookings.status, ["confirmed", "completed", "no_show"]),
                      and(eq(bookings.status, "held"), gt(bookings.holdExpiresAt, now)),
                    ),
                  ),
                )
            ).map((b) => toCalendarEvent(b, shop.timezone))}
          />
          <p className="text-sm text-ink-2">
            Salon time ({shop.timezone.replace("_", " ")}). Grey is outside opening hours. Faded bookings are
            held for a client who is paying right now. Click a booking to open it.
          </p>
        </div>
      )}
      {current === "table" && (
        <BookingsGrid
          rows={(
            await db
              .select()
              .from(bookings)
              .where(and(ofShop, eq(bookings.paymentStatus, "paid")))
              .orderBy(desc(bookings.startsAt))
          ).map((b) => toGridRow(b, shop.timezone))}
        />
      )}
    </div>
  );
}
