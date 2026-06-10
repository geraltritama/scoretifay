import { ReactNode } from "react";
import { User, Briefcase, Landmark, LineChart, Home, ShieldCheck } from "lucide-react";

export type StepKey = "character" | "capacity" | "capital" | "condition" | "collateral";

const STEPS: { key: StepKey; label: string; icon: typeof User }[] = [
  { key: "character", label: "Character", icon: User },
  { key: "capacity", label: "Capacity", icon: Briefcase },
  { key: "capital", label: "Capital", icon: Landmark },
  { key: "condition", label: "Condition", icon: LineChart },
  { key: "collateral", label: "Collateral", icon: Home },
];

interface Props {
  current: StepKey;
  title: string;
  subtitle: string;
  onSubmit: () => void;
  children: ReactNode;
}

export function StepCard({ current, title, subtitle, onSubmit, children }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New 5C Credit Assessment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete each of the five steps below for a transparent, data-driven loan decision.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Stepper card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i <= currentIndex;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-2 ${active ? "text-foreground font-semibold" : "text-muted-foreground"} ${i === STEPS.length - 1 ? "justify-end" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Step {currentIndex + 1} of 5 — {STEPS[currentIndex].label}
        </p>

        <div className="mt-8">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-6 space-y-5"
          >
            {children}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
