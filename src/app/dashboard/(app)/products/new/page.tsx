import { Eyebrow } from "@/components/ui/primitives";
import { requireSellerShop } from "@/server/seller-session";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await requireSellerShop();
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-2">Products</Eyebrow>
        <h1 className="text-display-sm">Add a product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
