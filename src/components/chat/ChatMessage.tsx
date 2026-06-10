import { Bot, User } from "lucide-react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

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
            if (isUser) {
              return (
                <span key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                  {part.text}
                </span>
              );
            }
            return (
              <div key={`${message.id}-${i}`} className="prose-chat">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="mb-1.5 ml-3 list-disc space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-1.5 ml-3 list-decimal space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    h1: ({ children }) => <p className="mb-1 font-bold">{children}</p>,
                    h2: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
                    h3: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
                    code: ({ children }) => (
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => <div className="my-1">{children}</div>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-emerald-600 pl-2 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
