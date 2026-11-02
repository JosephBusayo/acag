import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/primitives";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema";
import { requireSellerShop } from "@/server/seller-session";
import { formatOptions } from "@/server/seller/product-input";
import { ProductForm } from "../product-form";

const usd = (amountCents: number) => (amountCents / 100).toFixed(2);

export default async function EditProductPage({ params }: PageProps<"/dashboard/products/[id]">) {
  const shop = await requireSellerShop();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.shopId, shop.id)));
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-2">Products</Eyebrow>
        <h1 className="text-display-sm">{product.name}</h1>
      </div>
      <ProductForm
        defaults={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: usd(product.priceCents),
          options: formatOptions(product.options),
          isAvailable: product.isAvailable,
          negotiationEnabled: product.negotiationEnabled,
          minimumPrice: product.minimumPriceCents ? usd(product.minimumPriceCents) : "",
        }}
      />
    </div>
  );
}
