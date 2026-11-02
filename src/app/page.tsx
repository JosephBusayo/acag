import { ButtonLink } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/primitives";

const steps = [
  { title: "Screenshot", text: "Send a product photo from any post." },
  { title: "Chat & confirm", text: "The assistant finds it, confirms options and can haggle." },
  { title: "Pay with PayPal", text: "The order is marked Paid only after server verification." },
];

export default function DemoHub() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-10 md:py-14">
      <p className="font-display text-xl">Acag</p>

      <section className="mt-10 max-w-3xl md:mt-16">
        <Eyebrow className="mb-3">AI commerce agent for social sellers</Eyebrow>
        <h1 className="text-display-sm md:text-display">
          From &ldquo;how much?&rdquo;{" "}
          <em className="font-normal text-ink-3">to a paid order, in one chat.</em>
        </h1>
        <p className="mt-4 max-w-xl text-ink-2">
          Acag turns product questions and social-media screenshots into confirmed PayPal orders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/s/tenth-lane">Try the buyer experience</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            Open the seller dashboard
          </ButtonLink>
        </div>
      </section>

      <ol className="mt-12 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card className="h-full">
              <p className="font-display text-display-sm text-line">0{index + 1}.</p>
              <h2 className="mt-3 text-lg">{step.title}</h2>
              <p className="mt-1 text-sm text-ink-2">{step.text}</p>
            </Card>
          </li>
        ))}
      </ol>

      <section className="mt-3 grid gap-3 md:grid-cols-2">
        <Card raised>
          <h2 className="text-lg">How to test</h2>
          <p className="mt-1 text-sm text-ink-2">
            Payments use PayPal Sandbox, so no real money moves. Log in at checkout with:
          </p>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-ink-2">Email</dt>
              <dd className="break-all">{process.env.DEMO_SANDBOX_BUYER_EMAIL}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-ink-2">Password</dt>
              <dd className="break-all">{process.env.DEMO_SANDBOX_BUYER_PASSWORD}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg">What does what</h2>
          <p className="mt-1 text-sm text-ink-2">
            AI matches screenshots to the catalogue and handles the conversation. The server sets
            every price and enforces the seller&apos;s private minimum. PayPal handles checkout, and
            payment status comes only from verified capture data.
          </p>
        </Card>
      </section>
    </main>
  );
}
