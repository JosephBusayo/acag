"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { saveProduct, type FormState } from "../../actions";

type Defaults = {
  id?: string;
  name?: string;
  description?: string;
  price?: string;
  options?: string;
  isAvailable?: boolean;
  negotiationEnabled?: boolean;
  minimumPrice?: string;
};

const initial: FormState = {};
const textarea =
  "w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base outline-none placeholder:text-ink-3 focus:border-ink";

export function ProductForm({ defaults = {} }: { defaults?: Defaults }) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  const [negotiable, setNegotiable] = useState(defaults.negotiationEnabled ?? false);

  // Dispatching by hand stops React resetting the form when validation fails.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Name">
        <Input name="name" defaultValue={defaults.name} required />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={defaults.description} className={textarea} />
      </Field>
      <Field label="Price (USD)">
        <Input name="price" type="number" step="0.01" min="0.01" defaultValue={defaults.price} required />
      </Field>
      <Field label="Options" hint="One per line, such as Size: S, M, L">
        <textarea name="options" rows={3} defaultValue={defaults.options} className={textarea} />
      </Field>
      <Field label={defaults.id ? "Replace image" : "Image"}>
        <Input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!defaults.id}
          className="py-2"
        />
      </Field>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isAvailable" defaultChecked={defaults.isAvailable ?? true} />
        In stock
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="negotiationEnabled"
          checked={negotiable}
          onChange={(event) => setNegotiable(event.target.checked)}
        />
        Allow negotiation
      </label>
      {negotiable && (
        <Field label="Private minimum price (USD)" hint="Buyers and the AI never see this.">
          <Input
            name="minimumPrice"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={defaults.minimumPrice}
            required
          />
        </Field>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving" : "Save product"}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-2">{hint}</span>}
    </label>
  );
}
