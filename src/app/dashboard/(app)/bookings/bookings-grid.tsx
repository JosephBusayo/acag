"use client";

import {
  AllCommunityModule,
  type ColDef,
  ModuleRegistry,
  type RowClickedEvent,
  themeQuartz,
  type ValueFormatterParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { GridRow } from "./rows";

ModuleRegistry.registerModules([AllCommunityModule]);

// Matches the tokens in globals.css.
const theme = themeQuartz.withParams({
  accentColor: "#f48d16",
  backgroundColor: "#ffffff",
  foregroundColor: "#251f19",
  borderColor: "#e4e0dd",
  headerBackgroundColor: "#eeede6",
  headerTextColor: "#68615a",
  rowHoverColor: "#f7f7f4",
  fontFamily: "inherit",
  fontSize: 14,
  headerFontWeight: 500,
  wrapperBorderRadius: 12,
});

const dollars = ({ value }: ValueFormatterParams<GridRow, number>) =>
  value == null ? "" : `$${value.toFixed(2)}`;

const statusLabels: Record<GridRow["status"], string> = {
  held: "Held",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

// yyyy-mm-dd as a local-midnight Date, which is what the date filter compares against.
const dayDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function BookingsGrid({ rows }: { rows: GridRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const columns = useMemo<ColDef<GridRow>[]>(
    () => [
      {
        headerName: "Date",
        colId: "day",
        valueGetter: ({ data }) => (data ? dayDate(data.day) : null),
        valueFormatter: ({ value }) =>
          value ? (value as Date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "",
        comparator: (_a, _b, nodeA, nodeB) => (nodeA.data?.startsAt ?? 0) - (nodeB.data?.startsAt ?? 0),
        filter: "agDateColumnFilter",
        sort: "desc",
        minWidth: 130,
      },
      { field: "time", headerName: "Time", sortable: false, minWidth: 95, maxWidth: 110 },
      { field: "client", headerName: "Client", filter: true, minWidth: 130 },
      { field: "style", headerName: "Style", filter: true, minWidth: 160 },
      {
        field: "lengthInches",
        headerName: "Length",
        filter: "agNumberColumnFilter",
        valueFormatter: ({ value }) => (value ? `${value} in` : "—"),
        minWidth: 100,
        maxWidth: 120,
      },
      { field: "plan", headerName: "Paid by", filter: true, minWidth: 120 },
      { field: "price", headerName: "Price", filter: "agNumberColumnFilter", valueFormatter: dollars, minWidth: 100 },
      { field: "paid", headerName: "Paid", filter: "agNumberColumnFilter", valueFormatter: dollars, minWidth: 100 },
      { field: "balance", headerName: "Due", filter: "agNumberColumnFilter", valueFormatter: dollars, minWidth: 100 },
      {
        field: "status",
        headerName: "Status",
        filter: true,
        valueFormatter: ({ value }) => (value ? statusLabels[value as GridRow["status"]] : ""),
        filterValueGetter: ({ data }) => (data ? statusLabels[data.status] : ""),
        minWidth: 120,
      },
      { field: "reference", headerName: "Ref", filter: true, minWidth: 110 },
    ],
    [],
  );

  const total = rows.reduce((sum, r) => sum + r.paid, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-10 w-full max-w-xs items-center gap-2 rounded-chip border border-line bg-surface-raised px-3 text-sm focus-within:border-accent">
          <Search className="size-4 text-ink-3" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Search bookings</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, style or ref"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3"
          />
        </label>
        <p className="text-sm text-ink-2">
          {rows.length} bookings · ${total.toFixed(2)} collected through PayPal
        </p>
      </div>
      <div className="h-[560px] w-full">
        <AgGridReact<GridRow>
          theme={theme}
          rowData={rows}
          columnDefs={columns}
          defaultColDef={{ flex: 1, sortable: true, resizable: true }}
          quickFilterText={search}
          getRowId={({ data }) => data.id}
          onRowClicked={(e: RowClickedEvent<GridRow>) => e.data && router.push(`/dashboard/bookings/${e.data.id}`)}
          rowClass="cursor-pointer"
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          overlayNoRowsTemplate="No paid bookings yet."
        />
      </div>
    </div>
  );
}
