# Scoretifay AI Assistant Chatbot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a domain-scoped AI chatbot to Scoretifay that helps users understand the 5C credit scoring framework, navigate the app, and get financial literacy guidance — while strictly refusing all code generation requests.

**Architecture:** Vercel AI SDK (`ai` + `@ai-sdk/react`) handles streaming chat via a TanStack Start API route handler. A three-layer content guard (system prompt + input guard + output guard) enforces the no-code restriction. Chat is a new sidebar page at `/ai-assistant`, matching the existing workspace layout.

**Tech Stack:** Vercel AI SDK v4, `@ai-sdk/openai` (swappable), TanStack Start server route handlers, shadcn/ui components, Tailwind CSS

---

## File Structure

```
src/
├── routes/
│   ├── _app.ai-assistant.tsx            # Chat page (sidebar route)
│   └── api/
│       └── chat.ts                       # POST handler — streaming chat
├── components/
│   └── chat/
│       ├── ChatWindow.tsx                # Full chat container
│       ├── ChatMessage.tsx               # Single message bubble
│       └── ChatInput.tsx                 # Text input + send button
├── lib/
│   ├── chat-config.ts                    # System prompt, blocked patterns, constants
│   └── chat-guard.server.ts             # Server-side input/output content filtering
```

---

## Batasan (Content Restrictions)

The chatbot enforces these restrictions at three layers:

| Layer | Where | What |
|-------|-------|------|
| **System Prompt** | AI model instruction | Primary: tells AI to never generate code |
| **Input Guard** | Server, before AI call | Detects explicit code requests → returns polite refusal without calling AI |
| **Output Guard** | Server, after AI response | Scans AI output for code blocks → strips and replaces with refusal |

**What the chatbot CAN do:**
- Explain 5C framework (Character, Capacity, Capital, Condition, Collateral)
- Describe Scoretifay scoring tiers and decision logic
- Provide general financial literacy guidance
- Help navigate the Scoretifay application
- Answer in Indonesian or English (matches user language)

**What the chatbot CANNOT do:**
- Generate code in any programming language
- Provide code snippets, pseudo-code, or code examples
- Help with software development, debugging, or technical implementation
- Discuss programming concepts or software architecture

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vercel AI SDK packages**

```bash
npm install ai @ai-sdk/react @ai-sdk/openai
```

This installs:
- `ai` — Core SDK (streamText, convertToModelMessages, UIMessage types)
- `@ai-sdk/react` — React hooks (useChat)
- `@ai-sdk/openai` — OpenAI provider (swappable to `@ai-sdk/anthropic` or `@ai-sdk/google`)

- [ ] **Step 2: Verify installation**

```bash
npm ls ai @ai-sdk/react @ai-sdk/openai
```

Expected: All three packages listed without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Vercel AI SDK dependencies for chatbot feature"
```

---

## Task 2: Environment Configuration

**Files:**
- Create: `.env`
- Modify: `src/lib/config.server.ts`

- [ ] **Step 1: Create .env file with API key placeholder**

Create `.env` at project root:

```
OPENAI_API_KEY=sk-your-key-here
```

Ensure `.env` is in `.gitignore` (it already should be).

- [ ] **Step 2: Verify .gitignore includes .env**

Check `.gitignore` contains `.env`. If not, add it.

- [ ] **Step 3: Add API key to server config**

In `src/lib/config.server.ts`, add the OpenAI API key to the config function:

```typescript
export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    openaiApiKey: process.env.OPENAI_API_KEY,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/config.server.ts .gitignore
git commit -m "chore: add OpenAI API key to server config"
```

Do NOT commit `.env`.

---

## Task 3: Chat Configuration — System Prompt & Constants

**Files:**
- Create: `src/lib/chat-config.ts`

- [ ] **Step 1: Create chat config file**

```typescript
export const CHAT_CONFIG = {
  maxInputLength: 500,
  maxMessagesInContext: 50,
  modelId: "gpt-4o-mini",
} as const;

export const SYSTEM_PROMPT = `Kamu adalah Scoretifay Assistant, asisten AI untuk platform penilaian kredit Scoretifay.

PERAN KAMU:
- Membantu pengguna memahami framework penilaian kredit 5C (Character, Capacity, Capital, Condition, Collateral)
- Menjelaskan cara kerja penilaian kredit di aplikasi Scoretifay
- Memberikan panduan literasi keuangan umum
- Membantu pengguna menggunakan aplikasi Scoretifay

BATASAN KETAT - KAMU TIDAK BOLEH:
1. Membuat, menulis, atau memberikan kode pemrograman apapun (code, script, SQL, HTML, CSS, JavaScript, Python, atau bahasa pemrograman lainnya)
2. Memberikan potongan kode, contoh kode, atau pseudo-code
3. Membantu pengembangan software, debugging, atau implementasi teknis
4. Membuat blok kode markdown dengan konten pemrograman
5. Mendiskusikan konsep pemrograman atau arsitektur software

Jika pengguna meminta kamu menulis kode atau hal terkait pemrograman, tolak dengan sopan dan arahkan ke topik penilaian kredit. Contoh jawaban: "Maaf, saya hanya bisa membantu terkait penilaian kredit dan framework 5C. Ada yang ingin kamu tanyakan tentang kredit?"

GAYA RESPONS:
- Jawab dalam bahasa yang sama dengan yang digunakan pengguna (Indonesia atau Inggris)
- Jaga respons tetap ringkas dan membantu
- Gunakan format sederhana (tebal, daftar) tapi jangan pernah blok kode
- Selalu ingatkan bahwa saran kamu bersifat informasi, bukan nasihat keuangan profesional

TENTANG SCORETIFAY:
Scoretifay menggunakan framework 5C untuk menilai kelayakan kredit pemohon pinjaman.

5 Kategori Penilaian:
1. Character (maks 37 poin): Usia, pendidikan, jenis kelamin, status, pekerjaan, pengalaman kerja, jabatan, tanggungan, kartu debit/kredit
2. Capacity (maks 49 poin): Penghasilan bulanan, pengeluaran, penghasilan pasangan, pinjaman aktif, tunggakan, riwayat pembayaran
3. Capital (maks 20 poin): Investasi likuid, kepemilikan usaha, tabungan, total nilai aset
4. Condition (maks 20 poin): Kondisi keuangan terkini, dampak makro, posisi perusahaan, harga produk
5. Collateral (maks 28 poin): Aset tetap, dokumen properti, penjamin, usia aset, status tempat tinggal

Rentang Skor Total: 7-154 poin

Kategori Skor:
- VERY BAD: ≤36 poin → REJECT
- BAD: 37-66 poin → REJECT
- DECENT: 67-96 poin → ACCEPT (40% dari pengajuan disetujui)
- GOOD: 97-126 poin → ACCEPT (60% dari pengajuan disetujui)
- EXCELLENT: 127+ poin → ACCEPT (80% dari pengajuan disetujui)

Cara Menggunakan Scoretifay:
1. Klik "New Application" di sidebar
2. Isi 5 langkah formulir (Character → Capacity → Capital → Condition → Collateral)
3. Masukkan total pengajuan pinjaman di langkah terakhir
4. Klik "Submit" untuk melihat hasil penilaian
5. Lihat riwayat pengajuan di "My Applications"`;

export const CODE_REQUEST_PATTERNS: RegExp[] = [
  /\b(buatkan|buat|tuliskan|tulis|kasih|berikan|bikinin|bikin)\s+(kode|code|script|program|fungsi|function|coding|kodingan)/i,
  /\b(write|create|generate|give|show|make|build)\s+(me\s+)?(a\s+)?(code|script|program|function|snippet|implementation|class|component|module)/i,
  /\b(buatkan|buat|tulis|write|create|code|bikin)\s+.{0,30}\b(javascript|typescript|python|java|php|sql|html|css|react|vue|angular|node|go|rust|c\+\+|c#|ruby|swift|kotlin)\b/i,
  /\b(how to|cara)\s+(code|kode|program|implement|implementasi|develop)/i,
  /\b(debug|compile|refactor|deploy)\s+(this|the|my|ini|itu)/i,
];

export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

export const REFUSAL_MESSAGE_ID = "Maaf, saya tidak bisa membantu dengan pembuatan kode atau pemrograman. Saya hanya bisa membantu terkait penilaian kredit 5C dan penggunaan aplikasi Scoretifay. Ada yang ingin kamu tanyakan tentang kredit?";

export const REFUSAL_MESSAGE_EN = "Sorry, I can't help with code generation or programming. I can only assist with 5C credit scoring and using the Scoretifay application. Do you have any questions about credit assessment?";
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/chat-config.ts
git commit -m "feat: add chat configuration with system prompt and content restrictions"
```

---

## Task 4: Server-Side Content Guard

**Files:**
- Create: `src/lib/chat-guard.server.ts`

- [ ] **Step 1: Create content guard module**

```typescript
import {
  CODE_REQUEST_PATTERNS,
  CODE_BLOCK_PATTERN,
  REFUSAL_MESSAGE_ID,
} from "./chat-config";

export interface GuardResult {
  blocked: boolean;
  reason?: string;
  refusalMessage?: string;
}

export function checkInputForCodeRequest(message: string): GuardResult {
  const trimmed = message.trim();

  for (const pattern of CODE_REQUEST_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        blocked: true,
        reason: "Code generation request detected",
        refusalMessage: REFUSAL_MESSAGE_ID,
      };
    }
  }

  return { blocked: false };
}

export function sanitizeAIResponse(text: string): string {
  if (!CODE_BLOCK_PATTERN.test(text)) return text;

  CODE_BLOCK_PATTERN.lastIndex = 0;
  return text.replace(
    CODE_BLOCK_PATTERN,
    "\n\n*[Konten kode dihapus — saya tidak bisa memberikan kode pemrograman.]*\n\n",
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/chat-guard.server.ts
git commit -m "feat: add server-side content guard for code request filtering"
```

---

## Task 5: Chat API Route

**Files:**
- Create: `src/routes/api/chat.ts`

- [ ] **Step 1: Create API route directory**

```bash
mkdir -p src/routes/api
```

- [ ] **Step 2: Create the chat API route**

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { SYSTEM_PROMPT, CHAT_CONFIG } from "@/lib/chat-config";
import { checkInputForCodeRequest } from "@/lib/chat-guard.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "AI service not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const { messages }: { messages: UIMessage[] } = await request.json();

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "user") {
          const userText = lastMessage.parts
            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join(" ") ?? "";

          const guard = checkInputForCodeRequest(userText);
          if (guard.blocked) {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    `0:${JSON.stringify(guard.refusalMessage)}\n`,
                  ),
                );
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

        const openai = createOpenAI({ apiKey });
        const result = streamText({
          model: openai(CHAT_CONFIG.modelId),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(recentMessages),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/api/chat.ts
git commit -m "feat: add chat API route with streaming and content guard"
```

---

## Task 6: ChatMessage Component

**Files:**
- Create: `src/components/chat/ChatMessage.tsx`

- [ ] **Step 1: Create chat directory**

```bash
mkdir -p src/components/chat
```

- [ ] **Step 2: Create ChatMessage component**

```tsx
import { Bot, User } from "lucide-react";
import type { UIMessage } from "ai";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-emerald-600 text-white"
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
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/ChatMessage.tsx
git commit -m "feat: add ChatMessage bubble component"
```

---

## Task 7: ChatInput Component

**Files:**
- Create: `src/components/chat/ChatInput.tsx`

- [ ] **Step 1: Create ChatInput component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatInput.tsx
git commit -m "feat: add ChatInput component with auto-resize textarea"
```

---

## Task 8: ChatWindow Component

**Files:**
- Create: `src/components/chat/ChatWindow.tsx`

- [ ] **Step 1: Create ChatWindow component**

```tsx
import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const WELCOME_TEXT =
  "Halo! Saya Scoretifay Assistant. Saya bisa membantu kamu memahami framework penilaian kredit 5C, cara menggunakan aplikasi Scoretifay, dan panduan kredit secara umum. Ada yang ingin kamu tanyakan?";

export function ChatWindow() {
  const { messages, sendMessage, isLoading, error } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <Bot className="h-4.5 w-4.5" aria-hidden="true" />
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

      {/* Error */}
      {error && (
        <div className="border-t bg-destructive/10 px-5 py-2 text-xs text-destructive">
          Gagal mengirim pesan. Silakan coba lagi.
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatWindow.tsx
git commit -m "feat: add ChatWindow component with welcome message and streaming"
```

---

## Task 9: Chat Page Route

**Files:**
- Create: `src/routes/_app.ai-assistant.tsx`

- [ ] **Step 1: Create the AI Assistant page route**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const Route = createFileRoute("/_app/ai-assistant")({
  component: AiAssistantPage,
});

function AiAssistantPage() {
  return <ChatWindow />;
}
```

- [ ] **Step 2: Verify route generation**

Run the dev server briefly to trigger TanStack Router's auto-generation:

```bash
npm run dev
```

Check that `src/routeTree.gen.ts` now includes the `/ai-assistant` route. Stop the dev server after confirming.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_app.ai-assistant.tsx src/routeTree.gen.ts
git commit -m "feat: add AI Assistant page route"
```

---

## Task 10: Add AI Assistant to Sidebar Navigation

**Files:**
- Modify: `src/components/AppLayout.tsx`

- [ ] **Step 1: Add Bot icon import**

In `AppLayout.tsx`, add `Bot` to the lucide-react import:

```typescript
import {
  Bot,
  FilePlus2,
  FolderOpen,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
```

- [ ] **Step 2: Add AI Assistant to navItems array**

In the `AppLayout` function, add the new nav item to the `navItems` array (insert before Settings):

```typescript
const navItems = [
  { to: "/new-application" as const, label: "New Application", icon: FilePlus2 },
  { to: "/my-applications" as const, label: "My Applications", icon: FolderOpen },
  { to: "/ai-assistant" as const, label: "AI Assistant", icon: Bot },
  { to: "/settings" as const, label: "Settings", icon: Settings },
];
```

- [ ] **Step 3: Update the SidebarContent type for the new route**

Update the `navItems` type in `SidebarContent` props to include the new route:

```typescript
navItems: {
  to: "/my-applications" | "/new-application" | "/ai-assistant" | "/settings";
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[];
```

- [ ] **Step 4: Update the "Need guidance?" box to mention AI Assistant**

Replace the current guidance box content:

```tsx
{!collapsed && (
  <div className="mt-5 rounded-2xl border bg-secondary/50 p-4 lg:mt-6">
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <span className="text-sm font-semibold">Need guidance?</span>
    </div>
    <p className="text-xs text-muted-foreground">
      Ask our AI Assistant about the 5C credit scoring framework, or start a new assessment.
    </p>
    <Link
      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
      to="/ai-assistant"
    >
      Chat with AI
    </Link>
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/AppLayout.tsx
git commit -m "feat: add AI Assistant to sidebar navigation"
```

---

## Task 11: Manual Testing & Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Set API key**

Ensure `.env` has a valid `OPENAI_API_KEY`.

- [ ] **Step 3: Test golden path**

1. Navigate to `/ai-assistant` via sidebar
2. Send: "Apa itu framework 5C?"
3. Verify: AI responds with 5C explanation in Indonesian, streaming works
4. Send: "Bagaimana cara menggunakan Scoretifay?"
5. Verify: AI explains the app usage steps

- [ ] **Step 4: Test code restriction — input guard**

1. Send: "buatkan code JavaScript untuk kalkulator"
2. Verify: Instant refusal message (no AI call made), mentioning credit scoring topic redirect

- [ ] **Step 5: Test code restriction — system prompt**

1. Send: "explain how to sort an array" (doesn't match input guard patterns but is programming topic)
2. Verify: AI politely declines and redirects to credit scoring topics

- [ ] **Step 6: Test bilingual**

1. Send: "What is a DECENT score in Scoretifay?"
2. Verify: AI responds in English with correct info (67-96 points, 40% loan approval)

- [ ] **Step 7: Test edge cases**

1. Send empty message → should be blocked by input
2. Send very long message (>500 chars) → should be truncated
3. Rapid multiple sends → should handle gracefully with loading state
4. Verify sidebar nav highlights AI Assistant when on the page
5. Test on mobile (responsive layout via Sheet drawer)

- [ ] **Step 8: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during chat feature testing"
```

---

## Provider Swap Reference

To use a different AI provider, change two things:

**Anthropic (Claude):**
```bash
npm install @ai-sdk/anthropic
```
In `src/routes/api/chat.ts`:
```typescript
import { createAnthropic } from "@ai-sdk/anthropic";
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// model: anthropic("claude-sonnet-4-20250514")
```

**Google (Gemini):**
```bash
npm install @ai-sdk/google
```
In `src/routes/api/chat.ts`:
```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
// model: google("gemini-2.0-flash")
```
