import { Card, Eyebrow } from "@/components/ui/primitives";
import { requireSellerShop } from "@/server/seller-session";
import { CopyLink } from "../copy-link";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const shop = await requireSellerShop();
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-2">Settings</Eyebrow>
        <h1 className="text-display-sm md:text-display-md">Shop settings</h1>
      </div>
      <SettingsForm
        name={shop.name}
        description={shop.description}
        deliveryFee={(shop.deliveryFeeCents / 100).toFixed(2)}
        deliveryInformation={shop.deliveryInformation}
        assistantInstructions={shop.assistantInstructions}
      />
      <Card className="max-w-xl space-y-2">
        <h2 className="text-lg">PayPal</h2>
        <p className="text-sm text-ink-2">
          Status: Sandbox. This prototype uses one disclosed demo merchant account, so no real
          money moves and sellers don&apos;t connect their own PayPal yet.
        </p>
      </Card>
      <CopyLink path={`/s/${shop.slug}`} />
    </div>
  );
}
