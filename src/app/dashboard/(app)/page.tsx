import { desc, eq } from "drizzle-orm";
import { ButtonLink } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { orders } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { CopyLink } from "./copy-link";
import { money } from "./format";
import { OrdersList } from "./orders-list";

export default async function OverviewPage() {
  const shop = await requireSellerShop();
  const all = await db
    .select()
    .from(orders)
    .where(eq(orders.shopId, shop.id))
    .orderBy(desc(orders.createdAt));
  const paid = all.filter((o) => o.paymentStatus === "paid");
  const revenue = paid.reduce((sum, o) => sum + o.totalCents, 0);

  const stats = [
    { label: "Orders", value: String(all.length) },
    { label: "Paid", value: String(paid.length) },
    { label: "Sandbox revenue", value: money(revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow className="mb-2">Overview</Eyebrow>
        <h1 className="text-display-sm md:text-display-md">{shop.name}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-ink-2">{stat.label}</p>
            <p className="mt-2 font-display text-2xl">{stat.value}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/dashboard/products/new">Add product</ButtonLink>
        <CopyLink path={`/s/${shop.slug}`} />
      </div>
      <section className="space-y-3">
        <h2 className="text-xl">Recent orders</h2>
        <OrdersList items={all.slice(0, 5)} />
      </section>
    </div>
  );
}
