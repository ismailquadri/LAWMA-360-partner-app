import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { money, useStore } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { Chip, Empty, PageHeader, Panel } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operations")({
  head: pageHead("Operations", "Crew roster and today's route plan for collections."),
  component: Operations,
});

function Operations() {
  const { model, completeStop, customerById } = useStore();
  return (
    <>
      <PageHeader eyebrow="Operations" title="Operations" sub="Today's crew roster and route plan." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.crews.map((crew) => {
          const stops = model.routeStops.filter((s) => s.crewId === crew.id);
          const done = stops.filter((s) => s.done).length;
          const pct = stops.length ? (done / stops.length) * 100 : 0;
          return (
            <div key={crew.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{crew.name}</p>
                <span className="rounded-md border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{crew.plate}</span>
              </div>
              <p className="mt-3 font-mono text-2xl tabular-nums">{done}/{stops.length} <span className="text-sm text-muted-foreground">stops</span></p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-heat" style={{ width: `${pct}%` }} /></div>
              <p className="mt-2 text-xs text-muted-foreground">{crew.members.join(" · ")}</p>
            </div>
          );
        })}
      </div>
      <Panel title="Route list" meta={`${model.routeStops.length} stops`} flush>
        {model.routeStops.length === 0 ? (
          <div className="p-5"><Empty>No stops scheduled. Accept pickup requests to build today’s route.</Empty></div>
        ) : (
          <ol className="divide-y">
            {model.routeStops.map((stop, i) => {
              const crew = model.crews.find((c) => c.id === stop.crewId);
              const customer = customerById(stop.customerId);
              const pickup = customer?.pickups.find((p) => p.id === stop.pickupId);
              return (
                <li key={stop.id} className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 px-4 py-4 sm:items-center sm:px-5 md:grid-cols-[auto_minmax(0,1fr)_auto_auto]", stop.done && "opacity-60")}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{customer?.name ?? stop.customerId}</p>
                    <p className="text-sm text-muted-foreground">{stop.address} · {stop.window}</p>
                    <p className="break-words font-mono text-xs text-muted-foreground">{crew?.name} ({crew?.plate}){pickup ? ` · ${pickup.id} · ${money(pickup.amount)}` : ""}</p>
                  </div>
                  <Chip label={stop.done ? "Completed" : "Scheduled"} />
                  <Button size="sm" variant="outline" className="col-span-3 w-full md:col-span-1 md:w-auto" disabled={stop.done} onClick={() => { completeStop(stop.id); toast.success(`${money(pickup?.amount ?? 0)} captured to earnings`); }}>
                    Mark complete
                  </Button>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </>
  );
}
