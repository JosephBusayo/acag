import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import type { orders } from "@/server/db/schema";
import { capitalise, money, PaymentBadge, shortDate } from "./format";

export function OrdersList({ items }: { items: (typeof orders.$inferSelect)[] }) {
  if (!items.length) {
    return <p className="rounded-card bg-surface p-4 text-ink-2">No orders yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((order) => (
        <li key={order.id}>
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-surface p-4 hover:bg-surface-sunken"
          >
            <span>
              <span className="block font-medium">{order.orderReference}</span>
              <span className="block text-sm text-ink-2">{shortDate(order.createdAt)}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm">{money(order.totalCents)}</span>
              <PaymentBadge status={order.paymentStatus} />
              <Badge>{capitalise(order.fulfilmentStatus)}</Badge>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
