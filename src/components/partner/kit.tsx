import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow: string; title: string; sub?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow text-heat-text">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
        {sub ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div> : null}
    </header>
  );
}

export function Panel({ title, meta, action, children, className, flush }: { title?: string; meta?: string; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-sm font-semibold">{title}</h2>
            {meta ? <span className="font-mono text-[11px] text-muted-foreground">{meta}</span> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={flush ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", accent && "border-heat/40 bg-heat-soft")}>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2.5 truncate font-mono text-xl sm:text-2xl font-medium tracking-tight tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

const tones = {
  forest: "bg-forest-bg text-forest-text",
  honey: "bg-honey-bg text-honey-text",
  crimson: "bg-crimson-bg text-crimson-text",
  blue: "bg-blue-bg text-blue-text",
  neutral: "bg-accent text-muted-foreground",
  heat: "bg-heat-soft text-heat-text",
} as const;
const dots = { forest: "bg-forest", honey: "bg-honey", crimson: "bg-crimson", blue: "bg-blue", neutral: "bg-faint", heat: "bg-heat" } as const;

export function toneFor(label: string): keyof typeof tones {
  if (/complet|active|approv|resolv|deliver|settled|paid/i.test(label)) return "forest";
  if (/declin|attention|cancel|open/i.test(label)) return "crimson";
  if (/schedul|accept|allocat|review|out for/i.test(label)) return "blue";
  if (/request|pending/i.test(label)) return "honey";
  return "neutral";
}

export function Chip({ label, tone }: { label: string; tone?: keyof typeof tones }) {
  const t = tone ?? toneFor(label);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", tones[t])}>
      <span className={cn("size-1.5 rounded-full", dots[t])} />
      {label}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("eyebrow h-9 px-5 text-left font-normal text-muted-foreground", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3 align-middle", className)}>{children}</td>;
}
