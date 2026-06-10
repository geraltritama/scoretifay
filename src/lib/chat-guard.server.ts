import { CODE_REQUEST_PATTERNS, CODE_BLOCK_PATTERN, REFUSAL_MESSAGE_ID } from "./chat-config";

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
