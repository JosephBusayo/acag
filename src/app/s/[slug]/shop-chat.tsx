"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ImagePlus, Loader2, SendHorizontal } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Chip } from "@/components/ui/primitives";
import { ToolResult } from "./tool-result";

type Props = {
  slug: string;
  shopName: string;
  shopDescription: string;
  initialMessages: UIMessage[];
};

const SAMPLES = [
  { label: "White sneaker post", file: "/samples/clear-match.jpg" },
  { label: "Two white pairs", file: "/samples/ambiguous.jpg" },
];

const STARTERS = ["What do you sell?", "Show me your sneakers", "How much is delivery?"];

export function ShopChat({ slug, shopName, shopDescription, initialMessages }: Props) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, clearError } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // The server holds the history, so only the newest message is sent.
      prepareSendMessagesRequest: ({ messages }) => {
        const latest = messages[messages.length - 1];
        const text = latest.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(" ");
        const { imageUrl } = (latest.metadata ?? {}) as { imageUrl?: string };
        return { body: { slug, id: latest.id, text, imageUrl } };
      },
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    clearError();
    sendMessage({ text });
    setInput("");
  };

  async function uploadImage(file: File) {
    setUploading(true);
    setNotice(null);
    clearError();
    try {
      const form = new FormData();
      form.append("slug", slug);
      form.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      sendMessage({
        text: "Do you have this one?",
        metadata: { imageUrl: body.url },
      });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function sendSample(path: string) {
    const blob = await (await fetch(path)).blob();
    await uploadImage(new File([blob], "sample.jpg", { type: "image/jpeg" }));
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h1 className="text-lg leading-tight">{shopName}</h1>
          <p className="text-xs text-ink-2">{shopDescription}</p>
        </div>
        <span className="shrink-0 rounded-chip bg-surface px-2 py-1 text-xs text-ink-2">
          Sandbox
        </span>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {!hasMessages && (
          <div className="space-y-4 py-8">
            <p className="font-display text-display-sm">
              Saw something you like?{" "}
              <em className="font-normal text-ink-3">Show me.</em>
            </p>
            <p className="text-ink-2">
              Send a screenshot, or ask about anything in the shop.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          // Replies saved before ids were generated have an empty id.
          <Message key={message.id || index} message={message} slug={slug} onChoose={send} />
        ))}

        {(status === "submitted" || uploading) && (
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} aria-hidden />
            {uploading ? "Uploading your image" : "Thinking"}
          </p>
        )}

        {(error || notice) && (
          <p role="alert" className="rounded-card bg-danger/10 px-3 py-2 text-sm text-danger">
            {notice ?? errorText(error)}
          </p>
        )}
        <div ref={bottom} />
      </div>

      <div className="border-t border-line bg-bg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {!hasMessages && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {SAMPLES.map((sample) => (
              <Chip
                key={sample.file}
                disabled={busy || uploading}
                onClick={() => sendSample(sample.file)}
                className="shrink-0"
              >
                {sample.label}
              </Chip>
            ))}
            {STARTERS.map((text) => (
              <Chip key={text} disabled={busy} onClick={() => send(text)} className="shrink-0">
                {text}
              </Chip>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload a product image"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadImage(file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            aria-label="Add a screenshot"
            disabled={busy || uploading}
            onClick={() => fileInput.current?.click()}
            className="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface text-ink hover:bg-surface-sunken disabled:opacity-50"
          >
            <ImagePlus className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message the shop"
            aria-label="Message"
            className="min-h-11 min-w-0 flex-1 rounded-card border border-line bg-surface-raised px-3 text-base outline-none placeholder:text-ink-3 focus:border-ink"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={busy || !input.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-card bg-ink text-white disabled:opacity-40"
          >
            <SendHorizontal className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </div>
    </main>
  );
}

// Stream errors arrive as our own sentence; HTTP errors arrive as a JSON body.
function errorText(error: Error | undefined) {
  const fallback = "The assistant is busy right now. Please send that again.";
  if (!error?.message) return fallback;
  try {
    return (JSON.parse(error.message) as { error?: string }).error ?? fallback;
  } catch {
    return error.message.length < 160 ? error.message : fallback;
  }
}

function Message({
  message,
  slug,
  onChoose,
}: {
  message: UIMessage;
  slug: string;
  onChoose: (text: string) => void;
}) {
  const buyer = message.role === "user";
  const { imageUrl } = (message.metadata ?? {}) as { imageUrl?: string };

  return (
    <div className={`flex flex-col gap-2 ${buyer ? "items-end" : "items-start"}`}>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Your upload"
          width={200}
          height={200}
          unoptimized
          className="size-40 rounded-card object-cover"
        />
      )}
      {message.parts.map((part, index) => {
        if (part.type === "text" && part.text.trim()) {
          return (
            <p
              key={index}
              className={`max-w-[85%] rounded-card px-3 py-2 whitespace-pre-wrap ${
                buyer ? "bg-ink text-white" : "bg-surface-raised shadow-raised"
              }`}
            >
              {part.text}
            </p>
          );
        }
        if (part.type.startsWith("tool-")) {
          return <ToolResult key={index} part={part} slug={slug} onChoose={onChoose} />;
        }
        return null;
      })}
    </div>
  );
}
