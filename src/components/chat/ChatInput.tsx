import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { CHAT_CONFIG } from "@/lib/chat-config";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t bg-background p-4">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, CHAT_CONFIG.maxInputLength))}
        onKeyDown={handleKeyDown}
        placeholder="Tanya tentang penilaian kredit 5C..."
        disabled={isLoading}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        aria-label="Send message"
      >
        <SendHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
