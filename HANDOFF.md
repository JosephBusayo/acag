# Handoff: sponsor tools work in progress

Delete this file once the work below is finished.

## Done, not yet verified in the browser
- **AG Charts on the dashboard Overview.** `src/app/dashboard/(app)/overview-charts.tsx` has two charts: takings by appointment week (PayPal vs balance at the salon) and the most booked styles. Checked in the browser: they render, and the sideways-scroll bug is fixed.
- **AG Grid bookings table.** `src/app/dashboard/(app)/bookings/bookings-grid.tsx` is at `/dashboard/bookings?show=table`. It has sort, filters, quick search and pagination, and clicking a row opens the booking.
- **Bryntum Calendar.** It is at `/dashboard/bookings?show=calendar` and spans three files:
  - `bookings-calendar.tsx` is the calendar itself.
  - `calendar-view.tsx` loads it with `next/dynamic` and `ssr: false`.
  - `rows.ts` holds the row and event builders. Events use the salon's wall-clock time.
  - Closed days are non-working days. Opening hours are drawn with `coreHours`. Unpaid holds are faded (the `.acag-held` rule in `globals.css`).
- Packages: ag-grid-community and ag-grid-react 36.3.0, ag-charts-community and ag-charts-react 14.3.0, and `@bryntum/calendar` (an alias of calendar-trial 7.3.8) with `@bryntum/calendar-react`.
- Typecheck and lint passed.

## Still to do
1. **Check the Table and Calendar views in the browser.** Look for:
   - Events show up.
   - The calendar fills its 720px box.
   - Closed days are greyed.
   - Clicking an event opens the booking.

   npm skipped the Bryntum trial's postinstall scripts. If the calendar fails, approve them and reinstall.
2. **Refund on cancel through PayPal.**
   - POST `/v2/payments/captures/{paypalCaptureId}/refund` when a paid booking is cancelled in `updateBookingStatus` (`src/app/dashboard/actions.ts`).
   - Store the refund result and update the "Refunds are handled in PayPal" hint in `bookings/[id]/page.tsx`.
   - Only claim APIMatic if the APIMatic Context Plugin is actually used to build this.
3. **Optional:** add more past bookings to `src/server/db/seed.ts`, so the charts and grid look fuller.
4. **Update the docs.** Add AG Grid, AG Charts and Bryntum (plus APIMatic if used) to `docs/TOOLS.md` and the `README.md` stack and limits sections.
5. **Run the checks:** `npm run typecheck`, `npm run lint`, `npm test` and `npx next build`. Then commit, push and check the live site at https://acag-idop.onrender.com.

Still open from before: a live sandbox booking test. The user pays in PayPal Sandbox and sends the AC- reference, then the booking and webhook are checked in the database.
