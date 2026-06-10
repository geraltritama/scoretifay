import { useState, type ComponentType } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  FilePlus2,
  FolderOpen,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoUrl from "../../assets/logo/logo.png";

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sideNavClassName = isSidebarCollapsed
    ? "flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    : "flex min-w-fit items-center gap-2 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
  const sideNavActiveClassName = "bg-secondary text-foreground font-medium shadow-sm";
  const navItems = [
    { to: "/new-application" as const, label: "New Application", icon: FilePlus2 },
    { to: "/my-applications" as const, label: "My Applications", icon: FolderOpen },
    { to: "/settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex flex-col lg:flex-row">
        <div className="border-b bg-background/95 p-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <BrandBlock />
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-secondary"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,22rem)] p-0">
                <div className="flex h-full flex-col p-5">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Browse Scoretifay pages and supporting 5C guidance.
                    </SheetDescription>
                    <BrandBlock />
                  </SheetHeader>
                  <SidebarContent
                    navItems={navItems}
                    sideNavClassName="flex min-w-fit items-center gap-2 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    sideNavActiveClassName={sideNavActiveClassName}
                    closeOnSelect
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`hidden min-h-screen shrink-0 border-r bg-background/95 backdrop-blur transition-[width,padding] duration-300 lg:block ${
            isSidebarCollapsed ? "w-20 p-3" : "w-72 p-5"
          }`}
        >
          <div
            className={
              isSidebarCollapsed
                ? "mb-5 flex justify-center"
                : "mb-5 flex items-start justify-between gap-3"
            }
          >
            <BrandBlock
              collapsed={isSidebarCollapsed}
              onExpand={() => setIsSidebarCollapsed(false)}
            />
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <SidebarContent
            navItems={navItems}
            sideNavClassName={sideNavClassName}
            sideNavActiveClassName={sideNavActiveClassName}
            collapsed={isSidebarCollapsed}
          />
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function BrandBlock({
  collapsed = false,
  onExpand,
}: {
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  if (collapsed) {
    return (
      <div className="group relative flex justify-center">
        <Link
          to="/"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background p-1.5 shadow-sm transition-colors hover:bg-secondary"
          title="Scoretifay"
          aria-label="Scoretifay home"
        >
          <img
            src={logoUrl}
            alt="Scoretifay logo"
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={onExpand}
          className="absolute -right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-[background-color,color,opacity] hover:bg-secondary hover:text-foreground group-hover:opacity-100"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background p-1.5 shadow-sm">
        <img
          src={logoUrl}
          alt="Scoretifay logo"
          width={44}
          height={44}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <span
          className="block text-sm font-bold uppercase tracking-[0.24em] text-foreground"
          style={{ fontFamily: '"Cambria", "Georgia", serif' }}
        >
          Scoretifay
        </span>
        <span
          className="mt-0.5 flex items-center gap-0.5 text-lg font-bold tracking-normal text-foreground"
          style={{ fontFamily: '"Cambria", "Georgia", serif' }}
        >
          <span className="text-muted-foreground">Credit</span>
          <span>Score</span>
          <span className="ml-1 rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
            5C
          </span>
        </span>
      </div>
    </Link>
  );
}

function SidebarContent({
  navItems,
  sideNavClassName,
  sideNavActiveClassName,
  closeOnSelect = false,
  collapsed = false,
}: {
  navItems: {
    to: "/my-applications" | "/new-application" | "/settings";
    label: string;
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }[];
  sideNavClassName: string;
  sideNavActiveClassName: string;
  closeOnSelect?: boolean;
  collapsed?: boolean;
}) {
  return (
    <>
      {!collapsed && (
        <div className="mb-3 mt-5 px-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </div>
      )}
      <nav className={`flex flex-col gap-2 text-sm ${collapsed ? "items-center" : ""}`}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const link = (
            <Link
              to={to}
              activeProps={{ className: sideNavActiveClassName }}
              className={sideNavClassName}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {!collapsed && label}
            </Link>
          );

          return closeOnSelect ? (
            <SheetClose asChild key={to}>
              {link}
            </SheetClose>
          ) : (
            <div key={to}>{link}</div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-5 rounded-2xl border bg-secondary/50 p-4 lg:mt-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold">Need guidance?</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The 5C framework evaluates Character, Capacity, Capital, Condition, and Collateral.
          </p>
          <Link
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            to="/new-application"
          >
            Start Assessment
          </Link>
        </div>
      )}
    </>
  );
}
