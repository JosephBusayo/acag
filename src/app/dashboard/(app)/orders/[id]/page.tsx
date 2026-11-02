import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Chip, Eyebrow } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { orderItems, orders } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { updateFulfilment } from "../../../actions";
import { capitalise, money, PaymentBadge, shortDate } from "../../format";

const STATUSES = ["new", "processing", "shipped", "completed", "cancelled"] as const;
const UUID = /^[0-9a-f-]{36}$/;

export default async function OrderPage({ params }: PageProps<"/dashboard/orders/[id]">) {
  const shop = await requireSellerShop();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.shopId, shop.id)));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-sm text-ink-2 hover:text-ink">
          Back to orders
        </Link>
        <Eyebrow className="mt-4 mb-2">{shortDate(order.createdAt)}</Eyebrow>
        <h1 className="flex flex-wrap items-center gap-3 text-display-sm">
          {order.orderReference} <PaymentBadge status={order.paymentStatus} />
        </h1>
      </div>

      <Card>
        <h2 className="mb-3 text-lg">Items</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 py-1">
            <div>
              <p className="font-medium">{item.productNameSnapshot}</p>
              <p className="text-sm text-ink-2">
                {Object.entries(item.selectedOptions)
                  .map(([name, value]) => `${name} ${value}`)
                  .join(", ")}{" "}
                Qty {item.quantity}
              </p>
            </div>
            <p>{money(item.lineTotalCents)}</p>
          </div>
        ))}
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-ink-2">
          <div className="flex justify-between">
            <dt>Discount given</dt>
            <dd>{money(order.discountCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{money(order.deliveryFeeCents)}</dd>
          </div>
          <div className="flex justify-between font-medium text-ink">
            <dt>Total</dt>
            <dd>{money(order.totalCents)} USD</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg">Buyer</h2>
        <p className="text-sm text-ink-2">{order.buyerEmail ?? "Shown after payment"}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg">Fulfilment</h2>
        {order.paymentStatus === "paid" ? (
          <form action={updateFulfilment} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={order.id} />
            {STATUSES.map((status) => (
              <Chip
                key={status}
                name="status"
                value={status}
                type="submit"
                selected={order.fulfilmentStatus === status}
              >
                {capitalise(status)}
              </Chip>
            ))}
          </form>
        ) : (
          <p className="text-sm text-ink-2">Available once payment is verified.</p>
        )}
      </Card>
    </div>
  );
}
