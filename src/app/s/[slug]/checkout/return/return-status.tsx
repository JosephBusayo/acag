"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";

type State =
  | { kind: "processing" }
  | { kind: "paid"; reference: string }
  | { kind: "pending" }
  | { kind: "failed"; message: string };

export function ReturnStatus({ slug, token }: { slug: string; token?: string }) {
  const [state, setState] = useState<State>(
    token ? { kind: "processing" } : { kind: "failed", message: "This link has no payment details." },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      const res = await fetch("/api/checkout/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!active) return;
      if (res.ok && body.paymentStatus === "paid") {
        setState({ kind: "paid", reference: body.orderReference });
      } else if (res.ok && body.paymentStatus === "pending_payment") {
        setState({ kind: "pending" });
      } else {
        setState({ kind: "failed", message: body.error ?? "PayPal did not complete this payment." });
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      {state.kind === "processing" && (
        <>
          <Loader2 className="size-6 animate-spin text-accent" strokeWidth={1.5} aria-hidden />
          <h1 className="text-display-sm">Processing payment</h1>
          <p className="text-ink-2">Confirming with PayPal. Please keep this page open.</p>
        </>
      )}
      {state.kind === "paid" && (
        <>
          <h1 className="text-display-sm">Payment verified</h1>
          <p className="text-ink-2">Order reference {state.reference}</p>
        </>
      )}
      {state.kind === "pending" && (
        <>
          <h1 className="text-display-sm">Payment pending</h1>
          <p className="text-ink-2">PayPal is still processing this. Your chat will update once it clears.</p>
        </>
      )}
      {state.kind === "failed" && (
        <>
          <h1 className="text-display-sm">Payment not confirmed</h1>
          <p className="text-ink-2">{state.message}</p>
        </>
      )}
      {state.kind !== "processing" && <ButtonLink href={`/s/${slug}`}>Back to the chat</ButtonLink>}
    </main>
  );
}
