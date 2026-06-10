import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Filter, Eye, Info, X } from "lucide-react";
import { useDialogFocusTrap } from "@/hooks/use-dialog-focus-trap";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import {
  getApplicationDecision,
  getApplicationKelayakan,
  getApplicationStepScore,
  getApplicationTotalSkor,
  getFieldScoreBreakdown,
  getStepMaxScore,
  loadApplications,
  type Application,
} from "@/lib/applications";

export const Route = createFileRoute("/_app/my-applications")({
  head: () => ({ meta: [{ title: "Scoretifay — My Applications" }] }),
  component: MyApplications,
});

const DECISION_COLOR: Record<string, string> = {
  ACCEPT: "bg-emerald-500",
  REJECT: "bg-red-500",
  INVALID: "bg-amber-500",
  Approved: "bg-emerald-500",
  Review: "bg-amber-500",
  Rejected: "bg-red-500",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const SUBMITTED_AT_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatSubmittedAt(value: string) {
  return SUBMITTED_AT_FORMATTER.format(new Date(value));
}

function parseDateFilter(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  ).getTime();
}

function MyApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [decision, setDecision] = useState("");
  const [active, setActive] = useState<Application | null>(null);

  useEffect(() => {
    setApps(loadApplications());
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const d = new Date(a.submittedAt).getTime();
      const fromTime = from ? parseDateFilter(from) : undefined;
      const toTime = to ? parseDateFilter(to, true) : undefined;
      if (fromTime !== undefined && d < fromTime) return false;
      if (toTime !== undefined && d > toTime) return false;
      if (decision && getApplicationDecision(a) !== decision) return false;
      return true;
    });
  }, [apps, from, to, decision]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review every credit assessment you've submitted and revisit detailed score breakdowns.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <h2 className="font-semibold">Filter Applications</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="application-from-date" className="mb-1.5 block text-sm font-semibold">
              From Date
            </label>
            <input
              id="application-from-date"
              name="fromDate"
              type="date"
              autoComplete="off"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="application-to-date" className="mb-1.5 block text-sm font-semibold">
              To Date
            </label>
            <input
              id="application-to-date"
              name="toDate"
              type="date"
              autoComplete="off"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="application-decision" className="mb-1.5 block text-sm font-semibold">
              Status Keputusan
            </label>
            <select
              id="application-decision"
              name="decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            >
              <option value="">Semua keputusan</option>
              <option>ACCEPT</option>
              <option>REJECT</option>
              <option>INVALID</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
              setDecision("");
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:col-span-2 lg:col-span-1 lg:w-auto"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Reset Filter
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Application History</h2>
          <span className="text-xs text-muted-foreground">
            Showing your most recent submissions
          </span>
        </div>

        <div className="space-y-3 lg:hidden">
          {filtered.length === 0 ? (
            <div className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
              No applications yet.
            </div>
          ) : (
            filtered.map((a) => <ApplicationCard key={a.id} app={a} onView={() => setActive(a)} />)
          )}
        </div>

        <div className="hidden overflow-hidden rounded-lg border lg:block">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal Pengajuan</th>
                <th className="px-4 py-3 font-medium">Total Skor</th>
                <th className="px-4 py-3 font-medium">Keputusan</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSubmittedAt(a.submittedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{getApplicationTotalSkor(a)} / 154</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium text-white ${DECISION_COLOR[getApplicationDecision(a)]}`}
                      >
                        {getApplicationDecision(a)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setActive(a)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Lihat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground sm:items-center">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Applications you submit will appear here with their score and decision.
        </p>
      </div>

      {active && <DetailsModal app={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ApplicationCard({ app, onView }: { app: Application; onView: () => void }) {
  const decision = getApplicationDecision(app);

  return (
    <article className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{app.id}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatSubmittedAt(app.submittedAt)}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white ${DECISION_COLOR[decision]}`}
        >
          {decision}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-secondary/40 p-3 text-sm min-[420px]:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Total Skor</div>
          <div className="font-bold">{getApplicationTotalSkor(app)} / 154</div>
        </div>
        <div className="min-[420px]:text-right">
          <div className="text-xs text-muted-foreground">Aksi</div>
          <button
            type="button"
            onClick={onView}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Lihat
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailsModal({ app, onClose }: { app: Application; onClose: () => void }) {
  useLockBodyScroll();
  const dialogRef = useDialogFocusTrap(onClose);

  const cKeys = ["character", "capacity", "capital", "condition", "collateral"] as const;
  const kelayakan = getApplicationKelayakan(app);
  const decision = getApplicationDecision(app);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-title"
        tabIndex={-1}
        className="scrollbar-hidden max-h-[88vh] w-full max-w-2xl overflow-auto rounded-xl bg-card p-4 shadow-xl sm:max-h-[85vh] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 id="application-detail-title" className="text-xl font-bold">
              {app.id}
            </h3>
            <p className="text-xs text-muted-foreground">{formatSubmittedAt(app.submittedAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-secondary"
            aria-label="Close application detail"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Total Skor</div>
            <div className="text-3xl font-bold">{getApplicationTotalSkor(app)} / 154</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {kelayakan?.keteranganSkor ?? "LEGACY"}
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold text-white ${DECISION_COLOR[decision]}`}
          >
            {decision}
          </span>
        </div>

        {kelayakan && (
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
              <div className="text-lg font-bold">
                {formatRupiah(kelayakan.pinjamanYangDiperoleh)}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {cKeys.map((k) => (
            <div key={k} className="rounded-lg border p-3 text-center">
              <div className="text-xs capitalize text-muted-foreground">{k}</div>
              <div className="text-lg font-bold">
                {getApplicationStepScore(app, k)} / {getStepMaxScore(k)}
              </div>
            </div>
          ))}
        </div>

        <h4 className="mb-3 font-semibold">Field Score Details</h4>
        <div className="space-y-4">
          {cKeys.map((stepKey) => (
            <div key={stepKey}>
              <div className="mb-2 flex items-center justify-between">
                <h5 className="text-sm font-semibold capitalize">{stepKey}</h5>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
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
                    <span className="text-muted-foreground">{field.value || "Belum diisi"}</span>
                    <span className="font-semibold">{field.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
