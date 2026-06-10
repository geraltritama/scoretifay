import { Bot, User } from "lucide-react";
import type { UIMessage } from "ai";

interface ChatMessageProps {
  message: UIMessage;
  compact?: boolean;
}

export function ChatMessage({ message, compact = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const avatarSize = compact ? "h-7 w-7" : "h-8 w-8";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = compact ? "text-xs" : "text-sm";
  const padding = compact ? "px-3 py-2" : "px-4 py-2.5";

  return (
    <div className={`flex gap-${compact ? "2.5" : "3"} ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex ${avatarSize} shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
        }`}
      >
        {isUser ? (
          <User className={iconSize} aria-hidden={true} />
        ) : (
          <Bot className={iconSize} aria-hidden={true} />
        )}
      </div>
      <div
        className={`max-w-[82%] rounded-2xl ${padding} ${textSize} leading-relaxed ${
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
