import { Bot, User } from "lucide-react";
import type { UIMessage } from "ai";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bot className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <span key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                {part.text}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
