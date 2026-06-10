import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const WELCOME_TEXT =
  "Halo! Saya Scoretifay Assistant. Saya bisa membantu kamu memahami framework 5C, cara menggunakan Scoretifay, dan panduan kredit. Ada pertanyaan?";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Bot className="h-4 w-4" aria-hidden={true} />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Scoretifay Assistant</div>
                <div className="text-xs text-muted-foreground">Panduan kredit 5C</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" aria-hidden={true} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {/* Welcome */}
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Bot className="h-3.5 w-3.5" aria-hidden={true} />
                </div>
                <div className="max-w-[82%] rounded-2xl bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground">
                  {WELCOME_TEXT}
                </div>
              </div>

              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} compact />
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Bot className="h-3.5 w-3.5" aria-hidden={true} />
                  </div>
                  <div className="rounded-2xl bg-secondary px-3 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasError && (
            <div className="border-t bg-destructive/10 px-4 py-1.5 text-xs text-destructive">
              Gagal mengirim pesan. Silakan coba lagi.
            </div>
          )}

          <ChatInput onSend={handleSend} isLoading={isLoading} compact />
        </div>
      )}

      {/* FAB button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95"
        aria-label={isOpen ? "Tutup Scoretifay Assistant" : "Buka Scoretifay Assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden={true} />
        ) : (
          <Bot className="h-6 w-6" aria-hidden={true} />
        )}
      </button>
    </div>
  );
}
