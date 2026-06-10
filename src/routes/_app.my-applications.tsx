import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search, Eye, Info } from "lucide-react";

export const Route = createFileRoute("/_app/my-applications")({
  head: () => ({ meta: [{ title: "My Applications — CreditScore5C" }] }),
  component: MyApplications,
});

function MyApplications() {
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
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">To Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Decision Status</label>
            <select className="w-full rounded-md border border-input bg-secondary/60 px-3 py-2.5 text-sm">
              <option>All decisions</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Pending</option>
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
          <span className="text-xs text-muted-foreground">Showing your most recent submissions</span>
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
              <tr className="border-t">
                <td className="px-4 py-3 text-muted-foreground">Application #</td>
                <td className="px-4 py-3 text-muted-foreground">/ 100</td>
                <td className="px-4 py-3">
                  <span className="inline-block h-2 w-12 rounded-full bg-emerald-500" />
                </td>
                <td className="px-4 py-3">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Applications you submit will appear here with their score and decision.
        </p>
      </div>
    </div>
  );
}
