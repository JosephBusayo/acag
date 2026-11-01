import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`min-h-11 w-full rounded-card border border-line bg-surface-raised px-3 text-base text-ink outline-none placeholder:text-ink-3 focus:border-ink ${className}`}
      {...props}
    />
  );
}

export function Card({
  raised = false,
  className = "",
  ...props
}: ComponentProps<"div"> & { raised?: boolean }) {
  const tone = raised ? "bg-surface-raised shadow-raised" : "bg-surface";
  return <div className={`rounded-card p-4 ${tone} ${className}`} {...props} />;
}

const badgeTones = {
  neutral: "bg-surface text-ink-2",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof badgeTones }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip px-2 py-1 text-xs font-medium ${badgeTones[tone]} ${className}`}
      {...props}
    />
  );
}

export function Chip({
  selected = false,
  className = "",
  ...props
}: ComponentProps<"button"> & { selected?: boolean }) {
  const tone = selected ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-sunken";
  return (
    <button
      aria-pressed={selected}
      className={`min-h-9 rounded-chip px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${tone} ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ className = "", ...props }: ComponentProps<"p">) {
  return <p className={`text-sm leading-none font-semibold text-accent ${className}`} {...props} />;
}
