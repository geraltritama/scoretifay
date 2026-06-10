import { createFileRoute } from "@tanstack/react-router";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SYSTEM_PROMPT, CHAT_CONFIG } from "@/lib/chat-config";
import { checkInputForCodeRequest } from "@/lib/chat-guard.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI service not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { messages }: { messages: UIMessage[] } = await request.json();

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "user") {
          const userText =
            lastMessage.parts
              ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join(" ") ?? "";

          const guard = checkInputForCodeRequest(userText);
          if (guard.blocked) {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(guard.refusalMessage)}\n`));
                controller.close();
              },
            });
            return new Response(stream, {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Vercel-AI-Data-Stream": "v1",
              },
            });
          }
        }

        const recentMessages = messages.slice(-CHAT_CONFIG.maxMessagesInContext);

        const google = createGoogleGenerativeAI({ apiKey });
        const result = streamText({
          model: google(CHAT_CONFIG.modelId),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(recentMessages),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
