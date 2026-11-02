import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import { enterDemo } from "../actions";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
      <Eyebrow>Seller dashboard</Eyebrow>
      <h1 className="text-display-sm md:text-display-md">
        Tenth Lane <em className="font-normal text-ink-3">demo shop</em>
      </h1>
      <p className="text-ink-2">
        This prototype uses one demo seller and one PayPal Sandbox merchant account, with no
        password needed. Changes you make are visible to anyone testing the demo.
      </p>
      <form action={enterDemo}>
        <Button type="submit">Enter the dashboard</Button>
      </form>
    </main>
  );
}
