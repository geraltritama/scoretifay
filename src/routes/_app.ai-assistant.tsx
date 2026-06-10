import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const Route = createFileRoute("/_app/ai-assistant")({
  component: AiAssistantPage,
});

function AiAssistantPage() {
  return <ChatWindow />;
}
