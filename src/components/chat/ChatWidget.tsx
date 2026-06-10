import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const WELCOME_TEXT =
  "Halo! Saya Scoretifay Assistant. Saya bisa membantu kamu memahami framework 5C, cara menggunakan Scoretifay, dan panduan kredit. Ada pertanyaan?";

const FAB_SIZE = 56;

interface DragState {
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
  moved: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const { messages, sendMessage, status } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const getContainerPos = useCallback((): { x: number; y: number } => {
    if (pos) return pos;
    const el = containerRef.current;
    if (!el) {
      return {
        x: window.innerWidth - FAB_SIZE - 24,
        y: window.innerHeight - FAB_SIZE - 24,
      };
    }
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [pos]);

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const current = getContainerPos();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: current.x,
        startPosY: current.y,
        moved: false,
      };
    },
    [getContainerPos]
  );

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.moved = true;
    }
    if (dragRef.current.moved) {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - FAB_SIZE, dragRef.current.startPosX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragRef.current.startPosY + dy)),
      });
    }
  }, []);

  const onFabPointerUp = useCallback(() => {
    if (!dragRef.current?.moved) {
      setIsOpen((prev) => !prev);
    }
    dragRef.current = null;
  }, []);

  const onHeaderPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 ${pos ? "" : "bottom-6 right-6"}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
    >
      {/* Chat panel - positioned above FAB */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+12px)] right-0 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          {/* Draggable header */}
          <div
            className="flex cursor-grab select-none items-center justify-between gap-3 border-b bg-background px-4 py-3 active:cursor-grabbing"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onHeaderPointerUp}
          >
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
              onPointerDown={(e) => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" aria-hidden={true} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {/* Welcome message */}
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
        className="flex h-14 w-14 touch-none cursor-grab items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-[background-color,box-shadow] hover:bg-emerald-700 hover:shadow-xl active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onFabPointerUp}
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
