import { Fragment, ReactNode, useEffect, useId, useRef, useState } from "react";
import { Check, User, Briefcase, Landmark, LineChart, Home, ShieldCheck } from "lucide-react";

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
  direction?: "forward" | "backward" | "initial";
  title: string;
  subtitle: string;
  onSubmit: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  submitLabel?: string;
  formError?: string;
  children: ReactNode;
}

export function StepCard({
  current,
  direction = "initial",
  title,
  subtitle,
  onSubmit,
  onPrevious,
  canGoPrevious = false,
  submitLabel = "Submit",
  formError,
  children,
}: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  // Step pill pop: track newly activated step
  const prevCurrentRef = useRef(current);
  const [poppingStep, setPoppingStep] = useState<StepKey | null>(null);

  useEffect(() => {
    if (prevCurrentRef.current !== current) {
      setPoppingStep(current);
      prevCurrentRef.current = current;
      const t = setTimeout(() => setPoppingStep(null), 350);
      return () => clearTimeout(t);
    }
  }, [current]);

  // Error shake: increment key to remount error div on each new error
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (formError && formError !== prevErrorRef.current) {
      setShakeKey((k) => k + 1);
    }
    prevErrorRef.current = formError;
  }, [formError]);

  // Slide animation class for form content
  const slideClass =
    direction === "forward"
      ? "animate-step-from-right"
      : direction === "backward"
        ? "animate-step-from-left"
        : "";

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            New 5C Credit Assessment
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Complete each of the five steps below for a transparent, data-driven loan decision.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Stepper card */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        {/* Mobile: compact horizontal stepper */}
        <div className="flex items-center sm:hidden">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <Fragment key={s.key}>
                {/* Connecting line with animated fill */}
                {i > 0 && (
                  <div className="relative h-px flex-1 overflow-hidden bg-border">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary"
                      style={{
                        width: isPast ? "100%" : "0%",
                        transition: "width 420ms cubic-bezier(0.34, 1.1, 0.64, 1)",
                      }}
                    />
                  </div>
                )}
                {/* Step circle */}
                <div
                  className={`flex flex-col items-center ${poppingStep === s.key ? "animate-step-pop" : ""}`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : isPast
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isPast ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        {/* Desktop/tablet: full step cards */}
        <div className="hidden grid-cols-2 gap-3 sm:grid xl:grid-cols-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = i === currentIndex;
            return (
              <div
                key={s.key}
                className={`rounded-2xl border px-4 py-3 transition-[border-color,box-shadow,color] ${
                  isCurrent
                    ? "border-primary/40 text-foreground ring-1 ring-primary/20 hover:border-primary hover:shadow-sm"
                    : "border-border/70 text-muted-foreground"
                } ${poppingStep === s.key ? "animate-step-pop" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isCurrent
                        ? "border border-primary/30 text-primary"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Step {i + 1}
                    </div>
                    <span className="mt-1 block text-sm font-semibold leading-5">{s.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar with spring easing */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${progress}%`,
              transition: "width 480ms cubic-bezier(0.34, 1.3, 0.64, 1)",
            }}
          />
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Step {currentIndex + 1} of 5 — {STEPS[currentIndex].label}
        </p>

        {/* Form content: slides in on step change */}
        <div key={current} className={`mt-8 overflow-hidden ${slideClass}`}>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-6 space-y-5"
          >
            {formError && (
              <div
                key={shakeKey}
                className="animate-error-shake rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                aria-live="polite"
              >
                {formError}
              </div>
            )}
            {children}
            <div
              className={`flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center ${
                canGoPrevious ? "sm:justify-between" : "sm:justify-end"
              }`}
            >
              {canGoPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  className="w-full rounded-xl border border-input bg-background px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary sm:w-auto"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                {submitLabel}
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
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-semibold">
        {label}
      </label>
      <select
        id={fieldId}
        name={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-secondary/60 px-3.5 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
