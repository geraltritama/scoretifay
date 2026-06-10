import { describe, it, expect } from "vitest";
import {
  CHAT_CONFIG,
  SYSTEM_PROMPT,
  CODE_REQUEST_PATTERNS,
  CODE_BLOCK_PATTERN,
  REFUSAL_MESSAGE_ID,
  REFUSAL_MESSAGE_EN,
} from "./chat-config";

describe("CHAT_CONFIG", () => {
  it("has a positive maxInputLength", () => {
    expect(CHAT_CONFIG.maxInputLength).toBeGreaterThan(0);
  });

  it("has a positive maxMessagesInContext", () => {
    expect(CHAT_CONFIG.maxMessagesInContext).toBeGreaterThan(0);
  });

  it("has a non-empty modelId", () => {
    expect(CHAT_CONFIG.modelId).toBeTruthy();
  });
});

describe("SYSTEM_PROMPT", () => {
  it("contains 5C framework reference", () => {
    expect(SYSTEM_PROMPT).toContain("Character");
    expect(SYSTEM_PROMPT).toContain("Capacity");
    expect(SYSTEM_PROMPT).toContain("Capital");
    expect(SYSTEM_PROMPT).toContain("Condition");
    expect(SYSTEM_PROMPT).toContain("Collateral");
  });

  it("contains code generation restriction", () => {
    expect(SYSTEM_PROMPT).toMatch(/tidak boleh/i);
    expect(SYSTEM_PROMPT).toMatch(/kode|code/i);
  });

  it("contains scoring tiers", () => {
    expect(SYSTEM_PROMPT).toContain("VERY BAD");
    expect(SYSTEM_PROMPT).toContain("BAD");
    expect(SYSTEM_PROMPT).toContain("DECENT");
    expect(SYSTEM_PROMPT).toContain("GOOD");
    expect(SYSTEM_PROMPT).toContain("EXCELLENT");
  });

  it("contains decision thresholds", () => {
    expect(SYSTEM_PROMPT).toContain("ACCEPT");
    expect(SYSTEM_PROMPT).toContain("REJECT");
  });
});

describe("CODE_REQUEST_PATTERNS", () => {
  const matchesAny = (input: string) =>
    CODE_REQUEST_PATTERNS.some((p) => p.test(input));

  describe("blocks code generation requests in Indonesian", () => {
    it("matches 'buatkan code JavaScript'", () => {
      expect(matchesAny("buatkan code JavaScript untuk kalkulator")).toBe(true);
    });

    it("matches 'tulis script Python'", () => {
      expect(matchesAny("tuliskan script python sorting")).toBe(true);
    });

    it("matches 'buat fungsi'", () => {
      expect(matchesAny("buat fungsi untuk validasi email")).toBe(true);
    });

    it("matches 'bikinin kodingan'", () => {
      expect(matchesAny("bikinin kodingan React buat form")).toBe(true);
    });

    it("matches 'berikan code'", () => {
      expect(matchesAny("berikan code HTML halaman login")).toBe(true);
    });
  });

  describe("blocks code generation requests in English", () => {
    it("matches 'write me a function'", () => {
      expect(matchesAny("write me a function to sort arrays")).toBe(true);
    });

    it("matches 'create a script'", () => {
      expect(matchesAny("create a script for data processing")).toBe(true);
    });

    it("matches 'generate code'", () => {
      expect(matchesAny("generate code for authentication")).toBe(true);
    });

    it("matches 'build a component'", () => {
      expect(matchesAny("build a component for the dashboard")).toBe(true);
    });

    it("matches 'show me a snippet'", () => {
      expect(matchesAny("show me a snippet for API calls")).toBe(true);
    });
  });

  describe("allows legitimate credit scoring questions", () => {
    it("allows 'apa itu framework 5C?'", () => {
      expect(matchesAny("apa itu framework 5C?")).toBe(false);
    });

    it("allows 'bagaimana cara menghitung skor kredit?'", () => {
      expect(matchesAny("bagaimana cara menghitung skor kredit?")).toBe(false);
    });

    it("allows 'what is a DECENT score?'", () => {
      expect(matchesAny("what is a DECENT score?")).toBe(false);
    });

    it("allows 'jelaskan tentang Character scoring'", () => {
      expect(matchesAny("jelaskan tentang Character scoring")).toBe(false);
    });

    it("allows 'berapa skor minimum untuk ACCEPT?'", () => {
      expect(matchesAny("berapa skor minimum untuk ACCEPT?")).toBe(false);
    });

    it("allows 'how does Capacity scoring work?'", () => {
      expect(matchesAny("how does Capacity scoring work?")).toBe(false);
    });

    it("allows 'cara menggunakan Scoretifay'", () => {
      expect(matchesAny("cara menggunakan Scoretifay")).toBe(false);
    });
  });
});

describe("CODE_BLOCK_PATTERN", () => {
  it("detects markdown code blocks", () => {
    const text = "Here is code:\n```javascript\nconsole.log('hi');\n```\nDone.";
    expect(CODE_BLOCK_PATTERN.test(text)).toBe(true);
  });

  it("detects code blocks without language tag", () => {
    CODE_BLOCK_PATTERN.lastIndex = 0;
    const text = "```\nsome code\n```";
    expect(CODE_BLOCK_PATTERN.test(text)).toBe(true);
  });

  it("does not match normal text", () => {
    CODE_BLOCK_PATTERN.lastIndex = 0;
    const text = "Skor kredit Anda adalah GOOD (97 poin).";
    expect(CODE_BLOCK_PATTERN.test(text)).toBe(false);
  });
});

describe("Refusal messages", () => {
  it("REFUSAL_MESSAGE_ID is non-empty Indonesian text", () => {
    expect(REFUSAL_MESSAGE_ID.length).toBeGreaterThan(0);
    expect(REFUSAL_MESSAGE_ID).toMatch(/kredit|Scoretifay/i);
  });

  it("REFUSAL_MESSAGE_EN is non-empty English text", () => {
    expect(REFUSAL_MESSAGE_EN.length).toBeGreaterThan(0);
    expect(REFUSAL_MESSAGE_EN).toMatch(/credit|Scoretifay/i);
  });
});
