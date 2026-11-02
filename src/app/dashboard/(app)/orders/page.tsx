import { desc, eq } from "drizzle-orm";
import { Eyebrow } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { orders } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { OrdersList } from "../orders-list";

export default async function OrdersPage() {
  const shop = await requireSellerShop();
  const items = await db
    .select()
    .from(orders)
    .where(eq(orders.shopId, shop.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-2">Orders</Eyebrow>
        <h1 className="text-display-sm md:text-display-md">
          Every sale, <em className="font-normal text-ink-3">verified.</em>
        </h1>
      </div>
      <OrdersList items={items} />
    </div>
  );
}
