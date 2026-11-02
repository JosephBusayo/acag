"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { saveSettings, type FormState } from "../../actions";

type Props = {
  name: string;
  description: string;
  deliveryFee: string;
  deliveryInformation: string;
  assistantInstructions: string;
};

const initial: FormState = {};
const textarea =
  "w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base outline-none focus:border-ink";

export function SettingsForm(props: Props) {
  const [state, action, pending] = useActionState(saveSettings, initial);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Shop name</span>
        <Input name="name" defaultValue={props.name} required />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea name="description" rows={2} defaultValue={props.description} className={textarea} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Delivery fee (USD)</span>
        <Input name="deliveryFee" type="number" step="0.01" min="0" defaultValue={props.deliveryFee} required />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Delivery message</span>
        <textarea name="deliveryInformation" rows={2} defaultValue={props.deliveryInformation} className={textarea} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Assistant guidance</span>
        <textarea name="assistantInstructions" rows={3} defaultValue={props.assistantInstructions} className={textarea} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.saved && <p className="text-sm text-success">Saved</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving" : "Save settings"}
      </Button>
    </form>
  );
}
