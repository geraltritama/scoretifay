import { describe, it, expect } from "vitest";
import { checkInputForCodeRequest, sanitizeAIResponse } from "./chat-guard.server";

describe("checkInputForCodeRequest", () => {
  describe("blocks code generation requests", () => {
    it("blocks 'buatkan code JavaScript untuk kalkulator'", () => {
      const result = checkInputForCodeRequest("buatkan code JavaScript untuk kalkulator");
      expect(result.blocked).toBe(true);
      expect(result.refusalMessage).toBeTruthy();
    });

    it("blocks 'write me a function to sort arrays'", () => {
      const result = checkInputForCodeRequest("write me a function to sort arrays");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'create a Python script'", () => {
      const result = checkInputForCodeRequest("create a Python script for data processing");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'generate code for authentication'", () => {
      const result = checkInputForCodeRequest("generate code for authentication");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'buat fungsi validasi email'", () => {
      const result = checkInputForCodeRequest("buat fungsi validasi email");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'cara code React component'", () => {
      const result = checkInputForCodeRequest("cara code React component");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'how to implement sorting algorithm'", () => {
      const result = checkInputForCodeRequest("how to implement sorting algorithm");
      expect(result.blocked).toBe(true);
    });

    it("blocks 'debug this error'", () => {
      const result = checkInputForCodeRequest("debug this function error");
      expect(result.blocked).toBe(true);
    });
  });

  describe("allows legitimate credit scoring questions", () => {
    it("allows 'apa itu framework 5C?'", () => {
      const result = checkInputForCodeRequest("apa itu framework 5C?");
      expect(result.blocked).toBe(false);
    });

    it("allows 'bagaimana cara menghitung skor kredit?'", () => {
      const result = checkInputForCodeRequest("bagaimana cara menghitung skor kredit?");
      expect(result.blocked).toBe(false);
    });

    it("allows 'what is a DECENT score?'", () => {
      const result = checkInputForCodeRequest("what is a DECENT score?");
      expect(result.blocked).toBe(false);
    });

    it("allows 'berapa skor minimum untuk ACCEPT?'", () => {
      const result = checkInputForCodeRequest("berapa skor minimum untuk ACCEPT?");
      expect(result.blocked).toBe(false);
    });

    it("allows 'jelaskan tentang Capacity'", () => {
      const result = checkInputForCodeRequest("jelaskan tentang Capacity");
      expect(result.blocked).toBe(false);
    });

    it("allows 'how does the scoring system work?'", () => {
      const result = checkInputForCodeRequest("how does the scoring system work?");
      expect(result.blocked).toBe(false);
    });

    it("allows 'cara menggunakan Scoretifay'", () => {
      const result = checkInputForCodeRequest("cara menggunakan Scoretifay");
      expect(result.blocked).toBe(false);
    });

    it("allows empty string without crashing", () => {
      const result = checkInputForCodeRequest("");
      expect(result.blocked).toBe(false);
    });

    it("allows whitespace-only input", () => {
      const result = checkInputForCodeRequest("   ");
      expect(result.blocked).toBe(false);
    });
  });

  describe("returns proper structure", () => {
    it("returns reason when blocked", () => {
      const result = checkInputForCodeRequest("buatkan code Python");
      expect(result.blocked).toBe(true);
      expect(result.reason).toBeTruthy();
      expect(typeof result.reason).toBe("string");
    });

    it("returns no reason when allowed", () => {
      const result = checkInputForCodeRequest("apa itu skor kredit?");
      expect(result.blocked).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });
});

describe("sanitizeAIResponse", () => {
  it("passes through normal text unchanged", () => {
    const text = "Skor kredit Anda termasuk kategori GOOD dengan 105 poin.";
    expect(sanitizeAIResponse(text)).toBe(text);
  });

  it("passes through text with bold/italic formatting", () => {
    const text = "**Character** scoring meliputi *usia*, pendidikan, dan pekerjaan.";
    expect(sanitizeAIResponse(text)).toBe(text);
  });

  it("passes through text with bullet lists", () => {
    const text = "Kategori 5C:\n- Character\n- Capacity\n- Capital\n- Condition\n- Collateral";
    expect(sanitizeAIResponse(text)).toBe(text);
  });

  it("strips single code block", () => {
    const text = "Here:\n```javascript\nconsole.log('hi');\n```\nDone.";
    const result = sanitizeAIResponse(text);
    expect(result).not.toContain("```");
    expect(result).not.toContain("console.log");
    expect(result).toContain("kode pemrograman");
  });

  it("strips multiple code blocks", () => {
    const text = "First:\n```js\nconst a = 1;\n```\nSecond:\n```python\nprint('hi')\n```\nEnd.";
    const result = sanitizeAIResponse(text);
    expect(result).not.toContain("```");
    expect(result).not.toContain("const a");
    expect(result).not.toContain("print(");
  });

  it("strips code block without language tag", () => {
    const text = "Look:\n```\nsome code here\n```\nDone.";
    const result = sanitizeAIResponse(text);
    expect(result).not.toContain("```");
    expect(result).not.toContain("some code here");
  });

  it("preserves text surrounding stripped code blocks", () => {
    const text = "Before code.\n```js\nconst x = 1;\n```\nAfter code.";
    const result = sanitizeAIResponse(text);
    expect(result).toContain("Before code.");
    expect(result).toContain("After code.");
  });

  it("handles empty string", () => {
    expect(sanitizeAIResponse("")).toBe("");
  });
});
