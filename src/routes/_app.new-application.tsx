import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { StepCard, SelectField, StepKey } from "@/components/StepCard";
import { useDialogFocusTrap } from "@/hooks/use-dialog-focus-trap";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import {
  SCORING_RUBRIC,
  getFieldScoreBreakdown,
  getApplicationStepScore,
  getStepMaxScore,
  hitungKelayakanKredit,
  saveApplication,
  validateApplicationScores,
  validateTotalPengajuan,
  type Application,
  type CreditDecision,
} from "@/lib/applications";

export const Route = createFileRoute("/_app/new-application")({
  head: () => ({ meta: [{ title: "Scoretifay — New Application" }] }),
  component: NewApplication,
});

const STEP_ORDER: StepKey[] = ["character", "capacity", "capital", "condition", "collateral"];

const STEP_CONTENT: Record<StepKey, { title: string; subtitle: string }> = {
  character: {
    title: "Character",
    subtitle: "Your credit reputation and repayment track record.",
  },
  capacity: {
    title: "Capacity",
    subtitle: "Your ability to repay based on income and obligations.",
  },
  capital: {
    title: "Capital",
    subtitle: "Your savings, investments, and net financial position.",
  },
  condition: {
    title: "Condition",
    subtitle: "The purpose, amount, and terms of the requested loan.",
  },
  collateral: {
    title: "Collateral",
    subtitle: "Assets pledged to secure the loan.",
  },
};

const FIELDS = Object.fromEntries(
  STEP_ORDER.map((step) => [
    step,
    {
      ...STEP_CONTENT[step],
      fields: Object.entries(SCORING_RUBRIC[step]).map(([label, options]) => ({
        label,
        placeholder: `Pilih ${label}…`,
        options: options.map((option) => option.label),
      })),
    },
  ]),
) as Record<
  StepKey,
  {
    title: string;
    subtitle: string;
    fields: { label: string; placeholder: string; options: string[] }[];
  }
>;

function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>("character");
  const [stepDirection, setStepDirection] = useState<"forward" | "backward" | "initial">(
    "initial",
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [totalPengajuan, setTotalPengajuan] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<Application | null>(null);

  const config = FIELDS[step];
  const currentIndex = STEP_ORDER.indexOf(step);

  const handleSubmit = () => {
    const missing = config.fields
      .filter((field) => !values[field.label])
      .map((field) => field.label);

    if (missing.length > 0) {
      setMissingFields(missing);
      setSubmitError("");
      return;
    }

    setMissingFields([]);

    if (currentIndex < STEP_ORDER.length - 1) {
      setStepDirection("forward");
      setStep(STEP_ORDER[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    const totalPengajuanValidation = validateTotalPengajuan(totalPengajuan);
    if (!totalPengajuanValidation.valid) {
      setSubmitError(totalPengajuanValidation.error ?? "Total pengajuan tidak valid.");
      return;
    }
    const totalPengajuanValue = totalPengajuanValidation.value;

    const scoreValidation = validateApplicationScores(values);
    if (scoreValidation.errors.length > 0) {
      setSubmitError(scoreValidation.errors[0].message);
      return;
    }

    const { scores, totalSkor } = scoreValidation;
    const kelayakanKredit = hitungKelayakanKredit(totalSkor, totalPengajuanValue);

    if (kelayakanKredit.error) {
      setSubmitError(kelayakanKredit.error);
      return;
    }

    const app: Application = {
      id: `APP-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      values,
      scores,
      totalSkor,
      totalScore: totalSkor,
      totalPengajuan: totalPengajuanValue,
      kelayakanKredit,
      decision: kelayakanKredit.hasilKeputusanPengajuanKredit,
    };
    saveApplication(app);
    setResult(app);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) return;
    setMissingFields([]);
    setSubmitError("");
    setStepDirection("backward");
    setStep(STEP_ORDER[currentIndex - 1]);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <StepCard
        current={step}
        direction={stepDirection}
        title={config.title}
        subtitle={config.subtitle}
        onSubmit={handleSubmit}
        onPrevious={handlePrevious}
        canGoPrevious={currentIndex > 0}
        submitLabel={currentIndex === STEP_ORDER.length - 1 ? "Submit" : "Next"}
        formError={
          missingFields.length > 0
            ? "Lengkapi semua field pada step ini sebelum melanjutkan."
            : submitError
              ? submitError
              : undefined
        }
      >
        {currentIndex === STEP_ORDER.length - 1 && (
          <LoanAmountField
            value={totalPengajuan}
            error={submitError.includes("pengajuan") ? submitError : undefined}
            onChange={(value) => {
              setTotalPengajuan(value);
              setSubmitError("");
            }}
          />
        )}
        {config.fields.map((f) => (
          <SelectField
            key={f.label}
            label={f.label}
            placeholder={f.placeholder}
            options={f.options}
            value={values[f.label] ?? ""}
            error={missingFields.includes(f.label) ? `${f.label} wajib diisi.` : undefined}
            onChange={(v) => {
              setValues((s) => ({ ...s, [f.label]: v }));
              setMissingFields((fields) => fields.filter((field) => field !== f.label));
              setSubmitError("");
            }}
          />
        ))}
      </StepCard>

      {result && (
        <ResultModal
          app={result}
          onViewAll={() => navigate({ to: "/my-applications" })}
          onClose={() => {
            setResult(null);
            setValues({});
            setMissingFields([]);
            setTotalPengajuan("");
            setSubmitError("");
            setStepDirection("initial");
            setStep("character");
          }}
        />
      )}
    </>
  );
}

const DECISION_STYLE: Record<CreditDecision, { bg: string; label: string }> = {
  ACCEPT: { bg: "bg-emerald-600", label: "ACCEPT" },
  REJECT: { bg: "bg-red-600", label: "PINJAMAN DITOLAK" },
  INVALID: { bg: "bg-amber-500", label: "INVALID" },
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

function ResultModal({
  app,
  onViewAll,
  onClose,
}: {
  app: Application;
  onViewAll: () => void;
  onClose: () => void;
}) {
  useLockBodyScroll();
  const dialogRef = useDialogFocusTrap(onClose);

  const kelayakan =
    app.kelayakanKredit ?? hitungKelayakanKredit(app.totalScore, app.totalPengajuan ?? 0);
  const style = DECISION_STYLE[kelayakan.hasilKeputusanPengajuanKredit];
  const displayScore = useCountUp(kelayakan.totalSkor, 900);

  return (
    <div className="animate-backdrop-fade fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-result-title"
        tabIndex={-1}
        className="animate-modal-enter scrollbar-hidden max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="assessment-result-title" className="text-2xl font-bold">
            Your Assessment Result
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-secondary"
            aria-label="Close assessment result"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Score block with reveal + count-up */}
        <div className="animate-score-reveal mb-4 rounded-lg border bg-secondary/50 p-4 text-center">
          <div className="text-sm text-muted-foreground">Total Skor</div>
          <div className="mt-1 text-4xl font-bold">
            {displayScore}
            <span className="text-lg font-medium text-muted-foreground"> / 154</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-muted-foreground">
            {kelayakan.keteranganSkor}
          </div>
        </div>

        {/* Decision banner with delayed slide-up reveal */}
        <div
          className={`animate-decision-reveal mb-5 flex items-center gap-3 rounded-lg px-4 py-3 text-white ${style.bg}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Check className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="font-semibold">{style.label}</div>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border bg-background p-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Total Pengajuan</div>
            <div className="font-semibold">{formatRupiah(kelayakan.totalPengajuan)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Proporsi Pinjaman Di-ACC</div>
            <div className="font-semibold">
              {Math.round(kelayakan.proporsiPinjamanYangDiAcc * 100)}%
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-muted-foreground">Pinjaman Yang Diperoleh</div>
            <div className="text-lg font-bold">{formatRupiah(kelayakan.pinjamanYangDiperoleh)}</div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border bg-secondary/40 p-4">
          <h3 className="mb-3 font-semibold">Score Breakdown</h3>
          <div className="space-y-2 text-sm">
            {STEP_ORDER.map((k) => (
              <div key={k} className="flex items-center justify-between">
                <span className="capitalize text-muted-foreground">{k}</span>
                <span className="font-semibold">
                  {getApplicationStepScore(app, k)} / {getStepMaxScore(k)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-lg border bg-background p-4">
          <h3 className="mb-3 font-semibold">Field Score Details</h3>
          <div className="space-y-4">
            {STEP_ORDER.map((stepKey) => (
              <div key={stepKey}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{STEP_CONTENT[stepKey].title}</h4>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getApplicationStepScore(app, stepKey)} / {getStepMaxScore(stepKey)}
                  </span>
                </div>
                <div className="divide-y rounded-lg border text-sm">
                  {getFieldScoreBreakdown(stepKey, app.values).map((field) => (
                    <div
                      key={field.fieldLabel}
                      className="grid gap-1 px-3 py-2 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center"
                    >
                      <span className="font-medium">{field.fieldLabel}</span>
                      <span className="text-muted-foreground">{field.value}</span>
                      <span className="font-semibold">{field.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            View My Applications
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanAmountField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-semibold">
        Total Pengajuan
      </label>
      <input
        id={fieldId}
        name="totalPengajuan"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Contoh: 250000"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-secondary/60 px-3.5 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
