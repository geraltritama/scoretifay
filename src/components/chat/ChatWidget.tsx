import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Bot, ChevronDown, RefreshCw, Trash2, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const WELCOME_TEXT =
  "Halo! Saya Scoretifay Assistant. Saya bisa membantu kamu memahami framework 5C, cara menggunakan Scoretifay, dan panduan kredit. Ada pertanyaan?";

const SUGGESTED_QUESTIONS = [
  "Apa itu framework 5C?",
  "Bagaimana cara menghitung skor Character?",
  "Apa yang dimaksud Capacity dalam kredit?",
  "Berapa skor minimum untuk disetujui?",
  "Bagaimana cara menggunakan Scoretifay?",
];

const FAB_SIZE = 56;
const PANEL_WIDTH = 360;
const STORAGE_KEY = "scoretifay-chat-messages";

interface DragState {
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
  moved: boolean;
}

function loadStoredMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UIMessage[];
  } catch {}
  return [];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [initialMessages] = useState<UIMessage[]>(loadStoredMessages);

  const { messages, sendMessage, status, setMessages, clearError, regenerate } = useChat({
    messages: initialMessages,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error";

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 60);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setShowScrollBtn(false);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [setMessages]);

  const handleRetry = useCallback(() => {
    clearError();
    regenerate();
  }, [clearError, regenerate]);

  // Drag logic
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

  // Panel positioning — computed client-side only (window not available during SSR)
  const isBrowser = typeof window !== "undefined";
  const fabX = pos?.x ?? (isBrowser ? window.innerWidth - FAB_SIZE - 24 : 9999);
  const fabY = pos?.y ?? (isBrowser ? window.innerHeight - FAB_SIZE - 24 : 9999);
  const panelAlignRight = !isBrowser || fabX + FAB_SIZE >= PANEL_WIDTH;
  const panelHorizontal = panelAlignRight ? "right-0" : "left-0";
  const panelHeight = isBrowser ? Math.min(520, Math.max(300, fabY - 12)) : 520;

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 ${pos ? "" : "bottom-6 right-6"}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
    >
      {/* Chat panel */}
      {isOpen && (
        <div
          className={`absolute bottom-[calc(100%+12px)] ${panelHorizontal} flex w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl`}
          style={{ height: panelHeight }}
        >
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
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearConversation}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Hapus percakapan"
                  title="Hapus percakapan"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden={true} />
                </button>
              )}
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
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="relative flex-1 overflow-y-auto px-4 py-3"
            onScroll={handleScroll}
          >
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

              {/* Suggested questions — hidden once conversation starts */}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

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

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-16 right-4 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Gulir ke bawah"
            >
              <ChevronDown className="h-4 w-4" aria-hidden={true} />
            </button>
          )}

          {/* Error bar with retry */}
          {hasError && (
            <div className="flex items-center justify-between gap-2 border-t bg-destructive/10 px-4 py-2 text-xs text-destructive">
              <span>Gagal mengirim. Coba lagi?</span>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 transition-colors hover:bg-destructive/10"
                aria-label="Coba lagi"
              >
                <RefreshCw className="h-3 w-3" aria-hidden={true} />
                Coba lagi
              </button>
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
