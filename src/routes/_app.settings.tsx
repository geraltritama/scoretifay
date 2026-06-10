import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Scoretifay — Settings" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace preferences.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm text-sm text-muted-foreground">
        Settings options will appear here.
      </div>
    </div>
  ),
});
