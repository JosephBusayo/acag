"use client";

import dynamic from "next/dynamic";

// Bryntum needs the browser, so the calendar loads on the client only.
export const CalendarView = dynamic(() => import("./bookings-calendar"), {
  ssr: false,
  loading: () => <div className="h-[720px] animate-pulse rounded-card bg-surface" />,
});
