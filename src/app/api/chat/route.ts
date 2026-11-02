import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { buyerInstructions, createBuyerTools } from "@/server/ai/tools";
import { ensureBuyerSession, getOrCreateConversation } from "@/server/buyer-session";
import { getShopBySlug } from "@/server/catalogue/public";
import { db } from "@/server/db/client";
import { conversations } from "@/server/db/schema";
import { allowRequest } from "@/server/rate-limit";

export const maxDuration = 60;

const body = z.object({
  slug: z.string(),
  text: z.string().trim().min(1).max(2000),
  id: z.string().min(1).max(64),
  imageUrl: z.url().optional(),
});

export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid message" }, { status: 400 });
  if (parsed.data.imageUrl && !parsed.data.imageUrl.startsWith(`${process.env.SUPABASE_URL}/`)) {
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }

  const shop = await getShopBySlug(parsed.data.slug);
  if (!shop) return Response.json({ error: "Shop not found" }, { status: 404 });

  const sessionId = await ensureBuyerSession();
  if (!allowRequest(`chat:${sessionId}`, 20, 60_000)) {
    return Response.json({ error: "Too many messages. Try again in a minute." }, { status: 429 });
  }

  const conversation = await getOrCreateConversation(shop.id, sessionId);
  const buyerMessage: UIMessage = {
    id: parsed.data.id,
    role: "user",
    metadata: parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : undefined,
    parts: [{ type: "text", text: parsed.data.text }],
  };
  const history = [...(conversation.uiMessages as UIMessage[]), buyerMessage];
  const tools = createBuyerTools({ shop, conversationId: conversation.id });

  const result = streamText({
    model: google(process.env.AI_MODEL ?? ""),
    instructions: buyerInstructions(shop),
    messages: await convertToModelMessages(history, { tools }),
    tools,
    stopWhen: stepCountIs(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: history,
      onEnd: async ({ messages }) => {
        await db
          .update(conversations)
          .set({ uiMessages: messages, updatedAt: new Date() })
          .where(eq(conversations.id, conversation.id));
      },
    }),
  });
}
