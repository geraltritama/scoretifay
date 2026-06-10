import { Link, Outlet } from "@tanstack/react-router";
import { FilePlus2, FolderOpen, Settings, Info, LineChart } from "lucide-react";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top bar */}
      <header className="border-b bg-background">
        <div className="flex items-center gap-8 px-6 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LineChart className="h-5 w-5" />
            </div>
            <span>CreditScore5C</span>
          </Link>
          <nav className="ml-4 flex items-center gap-1 text-sm">
            <span className="rounded-md px-3 py-1.5 text-muted-foreground">CreditScore5C</span>
            <span className="rounded-md bg-secondary px-3 py-1.5 font-medium">Dashboard</span>
            <Link
              to="/my-applications"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary"
            >
              My Applications
            </Link>
            <Link
              to="/new-application"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary"
            >
              New Application
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r bg-background min-h-[calc(100vh-57px)] p-4">
          <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              to="/new-application"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-secondary"
            >
              <FilePlus2 className="h-4 w-4" /> New Application
            </Link>
            <Link
              to="/my-applications"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary"
            >
              <FolderOpen className="h-4 w-4" /> My Applications
            </Link>
            <Link
              to="/settings"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </nav>

          <div className="mt-6 rounded-lg border bg-secondary/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Info className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">Need guidance?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              The 5C framework evaluates Character, Capacity, Capital, Condition, and Collateral.
            </p>
            <a className="mt-2 inline-block text-xs font-medium text-primary hover:underline" href="#">
              Learn about the 5Cs
            </a>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
