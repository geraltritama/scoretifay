import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, Eye, Info, X } from "lucide-react";
import { loadApplications, type Application } from "@/lib/applications";

export const Route = createFileRoute("/_app/my-applications")({
  head: () => ({ meta: [{ title: "My Applications — CreditScore5C" }] }),
  component: MyApplications,
});

const DECISION_COLOR: Record<Application["decision"], string> = {
  Approved: "bg-emerald-500",
  Review: "bg-amber-500",
  Rejected: "bg-red-500",
};

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
      if (from && d < new Date(from).getTime()) return false;
      if (to && d > new Date(to).getTime() + 86400000) return false;
      if (decision && a.decision !== decision) return false;
      return true;
    });
  }, [apps, from, to, decision]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review every credit assessment you've submitted and revisit detailed score breakdowns.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h2 className="font-semibold">Filter Applications</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Decision Status</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            >
              <option value="">All decisions</option>
              <option>Approved</option>
              <option>Review</option>
              <option>Rejected</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Search className="h-4 w-4" /> Apply Filters
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Application History</h2>
          <span className="text-xs text-muted-foreground">
            Showing your most recent submissions
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Submission Date</th>
                <th className="px-4 py-3 font-medium">Total Score</th>
                <th className="px-4 py-3 font-medium">Decision</th>
                <th className="px-4 py-3 font-medium">Details</th>
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
                        {new Date(a.submittedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{a.totalScore} / 100</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium text-white ${DECISION_COLOR[a.decision]}`}
                      >
                        {a.decision}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setActive(a)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Applications you submit will appear here with their score and decision.
        </p>
      </div>

      {active && <DetailsModal app={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function DetailsModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const cKeys = ["character", "capacity", "capital", "condition", "collateral"] as const;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{app.id}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(app.submittedAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-lg border bg-secondary/40 p-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Score</div>
            <div className="text-3xl font-bold">{app.totalScore} / 100</div>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold text-white ${DECISION_COLOR[app.decision]}`}
          >
            {app.decision}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-2">
          {cKeys.map((k) => (
            <div key={k} className="rounded-lg border p-3 text-center">
              <div className="text-xs capitalize text-muted-foreground">{k}</div>
              <div className="text-lg font-bold">{app.scores[k]}</div>
            </div>
          ))}
        </div>

        <h4 className="mb-2 font-semibold">Answers</h4>
        <div className="space-y-1.5 text-sm">
          {Object.entries(app.values).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b py-1.5">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
