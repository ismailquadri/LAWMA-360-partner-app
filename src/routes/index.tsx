import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { money, useStore } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { Empty, Kpi, PageHeader, Panel } from "@/components/partner/kit";

export const Route = createFileRoute("/")({
  head: pageHead("Overview", "Today's pickup requests, routes, bins and remittance for your PSP operation."),
  component: Overview,
});

function Overview() {
  const { model } = useStore();
  const pendingRequests = model.customers.flatMap((c) => c.pickups.filter((p) => p.status === "Requested")).length;
  const pendingBins = model.binRequests.filter((b) => b.status === "Pending").length;
  const stopsOpen = model.routeStops.filter((s) => !s.done).length;
  const activeBins = model.customers.reduce((n, c) => n + c.bins.filter((b) => b.state === "Active").length, 0);
  const earned = model.settlements.reduce((n, s) => n + s.partnerShare, 0);
  const openIssue = model.customers.some((c) => c.status === "Attention needed");
  const attention = [
    ...(pendingRequests ? [{ title: `${pendingRequests} pickup request${pendingRequests > 1 ? "s" : ""}`, sub: "Awaiting accept or decline", action: "Review", to: "/requests" as const }] : []),
    ...(pendingBins ? [{ title: `${pendingBins} bin allocation request${pendingBins > 1 ? "s" : ""}`, sub: "Awaiting approval", action: "Review", to: "/requests" as const }] : []),
    ...(model.earningsUncaptured ? [{ title: `${money(model.earningsUncaptured)} unpaid remittance`, sub: "Due to LAWMA authority", action: "Remit", to: "/finance" as const }] : []),
    ...(openIssue ? [{ title: "Open customer issue", sub: "A customer reported a problem", action: "View", to: "/customers" as const }] : []),
  ];

  return (
    <>
      <PageHeader eyebrow="Partner console" title={`Good day, ${model.profile.name}`} sub="Here is what is happening across your customers today." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Pending requests" value={String(pendingRequests + pendingBins)} sub={`${pendingRequests} pickups · ${pendingBins} bins`} accent={pendingRequests + pendingBins > 0} />
        <Kpi label="Stops on route" value={String(stopsOpen)} sub="Active route plan" />
        <Kpi label="Active bins" value={String(activeBins)} sub={`${model.customers.length} customers`} />
        <Kpi label="Partner earnings" value={money(earned)} sub="Remitted share to date" />
        <Kpi label="Due to LAWMA" value={money(model.earningsUncaptured)} sub={model.earningsUncaptured ? "Remittance pending" : "All settled"} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Panel title="Activity feed" meta={`${model.activity.length} events`} flush>
          {model.activity.length === 0 ? (
            <div className="p-5"><Empty>No recent activity.</Empty></div>
          ) : (
            <ol className="divide-y">
              {model.activity.slice(0, 10).map((a) => (
                <li key={a.id} className="flex gap-3 px-5 py-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-heat" />
                  <div className="min-w-0">
                    <p className="text-sm">{a.text}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel title="Needs attention" meta={String(attention.length)} flush>
          {attention.length === 0 ? (
            <div className="p-5"><Empty>Nothing urgent right now.</Empty></div>
          ) : (
            <ul className="divide-y">
              {attention.map((item) => (
                <li key={item.title} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <Link to={item.to} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                    {item.action} <ArrowRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
