import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutGrid, Inbox, Users, Truck, Wallet, MessageSquare, Settings, Menu, X, Moon, Sun, LogOut, MoreHorizontal, ShieldCheck, Map as MapIcon } from "lucide-react";
import { ACCOUNTS, useStore } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { LawmaMark } from "./Logo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", short: "Home", icon: LayoutGrid },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/operations", label: "Operations", icon: Truck },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/fleet", label: "Fleet", icon: MapIcon },
  { to: "/security", label: "Security", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
const tabs = nav.filter((n) => ["/", "/requests", "/operations", "/finance", "/messages"].includes(n.to));

export function Shell({ children }: { children: ReactNode }) {
  const { model } = useStore();
  const { account, switchTo, signOut } = useAccount();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const pending =
    model.customers.reduce((n, c) => n + c.pickups.filter((p) => p.status === "Requested").length, 0) +
    model.binRequests.filter((b) => b.status === "Pending").length;
  const counts: Record<string, number> = { "/requests": pending };
  const current = nav.find((n) => (n.to === "/" ? path === "/" : path.startsWith(n.to)));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <LawmaMark />
        <div className="leading-tight">
          <p className="display text-[15px]">LAWMA 360</p>
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Partner console</p>
        </div>
      </div>
      <p className="eyebrow px-4 pt-3 pb-2 text-faint">Workspace</p>
      <nav className="flex flex-col gap-0.5 px-2">
        {nav.map((n) => {
          const active = current?.to === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-sm lg:min-h-9 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                active && "bg-sidebar-accent font-medium text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-heat-text")} />
              <span className="flex-1">{n.label}</span>
              {counts[n.to] ? <span className="rounded-md bg-heat-soft px-1.5 font-mono text-[11px] text-heat-text">{counts[n.to]}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-inverse font-mono text-xs text-inverse-foreground">
            {model.profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{model.profile.name}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">PSP · {model.profile.areas}</p>
          </div>
        </div>
        <label className="mt-2 block px-2">
          <span className="eyebrow text-faint">Demo · signed in as</span>
          <select
            aria-label="Switch partner account"
            value={account.id}
            onChange={(e) => switchTo(e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <button onClick={signOut} className="mt-2 flex h-10 w-full items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-sidebar lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-inverse/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-in slide-in-from-left border-r bg-sidebar duration-200">{sidebar}</aside>
        </div>
      ) : null}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <button aria-label="Open menu" className="-ml-2 grid size-10 place-items-center rounded-md hover:bg-accent lg:hidden" onClick={() => setOpen(true)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>SmartWaste360</span>
            <span className="text-faint">/</span>
            <span className="text-foreground">{current?.label ?? "Partner"}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-forest" /> Live · LAWMA link
            </span>
            <button aria-label="Toggle dark mode" onClick={toggleDark} className="grid size-10 place-items-center rounded-md border lg:size-8 text-muted-foreground hover:bg-accent hover:text-foreground">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 lg:pb-8">{children}</main>
        <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {tabs.map((n) => {
            const active = current?.to === n.to;
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={cn("relative flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground active:bg-accent", active && "text-foreground")}>
                <Icon className={cn("size-5", active && "text-heat-text")} />
                {"short" in n ? n.short : n.label}
                {counts[n.to] ? <span className="absolute top-2 left-1/2 ml-2 min-w-4 rounded-full bg-heat px-1 text-center font-mono text-[10px] leading-4 text-primary-foreground">{counts[n.to]}</span> : null}
              </Link>
            );
          })}
          <button onClick={() => setOpen(true)} className="flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground active:bg-accent">
            <MoreHorizontal className="size-5" /> More
          </button>
        </nav>
      </div>
    </div>
  );
}
