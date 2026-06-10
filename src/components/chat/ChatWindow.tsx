import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const WELCOME_TEXT =
  "Halo! Saya Scoretifay Assistant. Saya bisa membantu kamu memahami framework penilaian kredit 5C, cara menggunakan aplikasi Scoretifay, dan panduan kredit secara umum. Ada yang ingin kamu tanyakan?";

export function ChatWindow() {
  const { messages, sendMessage, status } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-sm lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <div className="text-sm font-semibold">Scoretifay Assistant</div>
          <div className="text-xs text-muted-foreground">
            Panduan kredit 5C &bull; Tidak bisa membuat kode
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {/* Welcome message */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2.5 text-sm leading-relaxed text-foreground">
              {WELCOME_TEXT}
            </div>
          </div>

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasError && (
        <div className="border-t bg-destructive/10 px-5 py-2 text-xs text-destructive">
          Gagal mengirim pesan. Silakan coba lagi.
        </div>
      )}

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
