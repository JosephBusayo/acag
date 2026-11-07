import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { CalendarCheck, CircleDollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/primitives";
import { addDays, dayLabel, weekdayOf } from "@/server/booking/time";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { BookingsList } from "./bookings-list";
import { CopyLink } from "./copy-link";
import { balanceOf, dayKey, money } from "./format";
import { OverviewCharts, type StyleCount, type WeekTakings } from "./overview-charts";

type Booking = typeof bookings.$inferSelect;

// Eight appointment weeks (three back, this one, four ahead), Monday first, in salon time.
function chartData(items: Booking[], timeZone: string) {
  const monday = (day: string) => addDays(day, -((weekdayOf(day) + 6) % 7));
  const thisWeek = monday(dayKey(new Date(), timeZone));
  const weeks = new Map<string, WeekTakings>();
  for (let i = -3; i <= 4; i++) {
    const start = addDays(thisWeek, i * 7);
    // "9 Nov" from dayLabel's "Monday 9 Nov".
    const week = i === 0 ? "This week" : dayLabel(start).split(" ").slice(1).join(" ");
    weeks.set(start, { week, paypal: 0, salon: 0 });
  }

  const counts = new Map<string, number>();
  for (const b of items) {
    counts.set(b.styleNameSnapshot, (counts.get(b.styleNameSnapshot) ?? 0) + 1);
    const week = weeks.get(monday(dayKey(b.startsAt, timeZone)));
    if (!week) continue;
    const viaPayPal = b.paymentStatus === "paid" ? (b.amountDueCents ?? 0) : 0;
    week.paypal += viaPayPal / 100;
    if (b.status !== "no_show") week.salon += Math.max(b.priceCents - viaPayPal, 0) / 100;
  }
  const styles: StyleCount[] = [...counts]
    .map(([style, bookings]) => ({ style, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);
  return { weeks: [...weeks.values()], styles };
}

export default async function OverviewPage() {
  const shop = await requireSellerShop();
  const upcoming = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.shopId, shop.id), eq(bookings.status, "confirmed"), gte(bookings.endsAt, new Date())))
    .orderBy(asc(bookings.startsAt));
  const paid = await db
    .select({ amountPaidCents: bookings.amountPaidCents })
    .from(bookings)
    .where(and(eq(bookings.shopId, shop.id), eq(bookings.paymentStatus, "paid")));

  const booked = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.shopId, shop.id), inArray(bookings.status, ["confirmed", "completed", "no_show"])));
  const { weeks, styles } = chartData(booked, shop.timezone);

  const collected = paid.reduce((sum, b) => sum + b.amountPaidCents, 0);
  const toCollect = upcoming.reduce((sum, b) => sum + balanceOf(b), 0);

  const stats = [
    { label: "Upcoming bookings", value: String(upcoming.length), icon: CalendarCheck },
    { label: "Collected up front", value: money(collected), icon: Wallet },
    { label: "Balance at appointments", value: money(toCollect), icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={shop.name}
        action={
          <div className="flex flex-wrap gap-2">
            <CopyLink path={`/s/${shop.slug}`} />
            <ButtonLink href="/dashboard/styles/new">Add style</ButtonLink>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between text-sm text-ink-2">
              {label}
              <Icon className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="mt-3 font-display text-3xl">{value}</p>
          </Card>
        ))}
      </div>
      <OverviewCharts weeks={weeks} styles={styles} />
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Coming up</h2>
          {upcoming.length > 6 && (
            <Link href="/dashboard/bookings" className="text-sm text-ink-2 hover:text-ink">
              View all
            </Link>
          )}
        </div>
        <BookingsList
          items={upcoming.slice(0, 6)}
          timeZone={shop.timezone}
          empty="No bookings yet. Put your booking link in your bio to get the first one."
        />
      </section>
    </div>
  );
}
