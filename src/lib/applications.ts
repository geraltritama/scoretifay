export type StepKey = "character" | "capacity" | "capital" | "condition" | "collateral";

export interface Application {
  id: string;
  submittedAt: string;
  values: Record<string, string>;
  scores: Record<StepKey, number>;
  totalScore: number;
  decision: "Approved" | "Review" | "Rejected";
}

const STORAGE_KEY = "creditscore5c.applications";

export function loadApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

export function saveApplication(app: Application) {
  const all = loadApplications();
  all.unshift(app);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Score a field based on its position in the options array.
 * Earlier options = lower score, later = higher. Returns 0-100.
 * Special-case binary Ya/Tidak: Ya = 100, Tidak = 0.
 */
export function scoreField(value: string, options: string[]): number {
  if (!value) return 0;
  if (options.length === 2 && options.includes("Ya") && options.includes("Tidak")) {
    return value === "Ya" ? 100 : 0;
  }
  const idx = options.indexOf(value);
  if (idx < 0) return 0;
  return Math.round((idx / Math.max(1, options.length - 1)) * 100);
}

export function decisionFromScore(total: number): Application["decision"] {
  if (total >= 70) return "Approved";
  if (total >= 50) return "Review";
  return "Rejected";
}
