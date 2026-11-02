import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { checkCompliance, RULES, seedFleet, tick } from "@/lib/fleet";
import { Chip, Kpi, PageHeader, Panel } from "@/components/partner/kit";
import { cn } from "@/lib/utils";

const FleetMap = lazy(() => import("@/components/partner/FleetMap"));

export const Route = createFileRoute("/fleet")({
  head: pageHead("Fleet", "Live fleet map and LAWMA management regulation compliance for your trucks."),
  component: Fleet,
});

function Fleet() {
  const { model } = useStore();
  const [fleet, setFleet] = useState(() => seedFleet(model.crews));
  const [selected, setSelected] = useState("");
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const o = new MutationObserver(read);
    o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => o.disconnect();
  }, []);
  useEffect(() => { const t = setInterval(() => setFleet(tick), 3000); return () => clearInterval(t); }, []);

  const rows = useMemo(() => fleet.map((v) => ({ ...v, violations: checkCompliance(v) })), [fleet]);
  const pins = useMemo(() => rows.map((r) => ({ ...r, flagged: r.violations.length > 0 })), [rows]);
  const compliant = rows.filter((r) => r.violations.length === 0).length;
  const onSelect = useCallback((id: string) => setSelected(id), []);
  const stopsFor = (crewId: string) => model.routeStops.filter((s) => s.crewId === crewId && !s.done).length;

  return (
    <>
      <PageHeader eyebrow="Fleet" title="Fleet & compliance" sub="Track your trucks live and keep every vehicle within LAWMA management regulations." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Vehicles" value={String(rows.length)} />
        <Kpi label="Compliant" value={`${compliant}/${rows.length}`} />
        <Kpi label="Open violations" value={String(rows.reduce((n, r) => n + r.violations.length, 0))} accent={compliant < rows.length} />
        <Kpi label="Speed limit" value={`${RULES.speedLimitKmh} km/h`} sub="Urban collection routes" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-[360px] overflow-hidden rounded-xl border bg-card sm:h-[520px]">
          <ClientOnly fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>}>
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>}>
              <FleetMap fleet={pins} selected={selected} onSelect={onSelect} dark={dark} />
            </Suspense>
          </ClientOnly>
        </div>
        <Panel title="Vehicles" meta="Live · every 3s" flush>
          <ul className="divide-y">
            {rows.map((v) => (
              <li key={v.crewId}>
                <button onClick={() => setSelected(v.crewId)} className={cn("w-full touch-manipulation px-4 py-3 text-left hover:bg-accent", selected === v.crewId && "bg-accent")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{v.crewName}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{v.plate} · {Math.round(v.speedKmh)} km/h · load {Math.round(v.loadPct)}% · {stopsFor(v.crewId)} stops</p>
                    </div>
                    <Chip label={v.violations.length ? `${v.violations.length} issue${v.violations.length > 1 ? "s" : ""}` : "Compliant"} tone={v.violations.length ? "crimson" : "forest"} />
                  </div>
                  {v.violations.length ? (
                    <ul className="mt-2 space-y-1">
                      {v.violations.map((x) => (
                        <li key={x.code} className="flex items-center gap-2 text-xs">
                          <span className={cn("size-1.5 shrink-0 rounded-full", x.severity === "high" ? "bg-crimson" : "bg-honey")} />
                          {x.label}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Management regulations checked">
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Speed at or below {RULES.speedLimitKmh} km/h on collection routes</li>
          <li>Load at or below {RULES.maxLoadPct}% of rated capacity</li>
          <li>Waste covered or in a closed body while moving</li>
          <li>Valid PSP operating permit</li>
          <li>Roadworthiness inspection within {RULES.inspectionDays} days</li>
          <li>GPS tracker reporting at least every {RULES.maxPingGapMin} minutes</li>
          <li>Operating inside the assigned service area</li>
          <li>Moving only between 6am and 10pm</li>
        </ul>
      </Panel>
    </>
  );
}
