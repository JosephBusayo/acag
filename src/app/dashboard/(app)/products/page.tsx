import { and, desc, eq, ne } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Eyebrow } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { archiveProduct } from "../../actions";
import { money } from "../format";

export default async function ProductsPage() {
  const shop = await requireSellerShop();
  const items = await db
    .select()
    .from(products)
    .where(and(eq(products.shopId, shop.id), ne(products.status, "archived")))
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow className="mb-2">Products</Eyebrow>
          <h1 className="text-display-sm md:text-display-md">Your catalogue</h1>
        </div>
        <ButtonLink href="/dashboard/products/new">Add product</ButtonLink>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <li key={product.id} className="overflow-hidden rounded-card bg-surface">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={480}
              height={360}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="space-y-2 p-3">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-ink-2">{money(product.priceCents)}</p>
              <div className="flex flex-wrap gap-1">
                <Badge tone={product.isAvailable ? "success" : "warning"}>
                  {product.isAvailable ? "In stock" : "Out of stock"}
                </Badge>
                {product.negotiationEnabled && <Badge>Negotiable</Badge>}
              </div>
              <div className="flex items-center gap-3 pt-1 text-sm">
                <Link href={`/dashboard/products/${product.id}`} className="underline">
                  Edit
                </Link>
                <form action={archiveProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <button className="text-ink-2 hover:text-danger">Archive</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
