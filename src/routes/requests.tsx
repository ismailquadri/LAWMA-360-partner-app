import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { money, useStore, type Pickup } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { Chip, Empty, PageHeader, Panel } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests")({
  head: pageHead("Requests", "Accept, schedule or decline customer pickup and bin allocation requests."),
  component: Requests,
});

function Requests() {
  const { model, acceptRequest, declineRequest, approveBinRequest, declineBinRequest, setPickupStatus, assignCrew } = useStore();
  const [acceptTarget, setAcceptTarget] = useState<Pickup | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Pickup | null>(null);
  const [binDecline, setBinDecline] = useState("");
  const all = model.customers.flatMap((c) => c.pickups.map((p) => ({ pickup: p, customer: c })));
  const groups = {
    pending: all.filter((x) => x.pickup.status === "Requested"),
    active: all.filter((x) => ["Accepted", "Scheduled", "Collected"].includes(x.pickup.status)),
    closed: all.filter((x) => ["Completed", "Declined", "Cancelled"].includes(x.pickup.status)),
  };
  const [tab, setTab] = useState<keyof typeof groups>("pending");
  const [openId, setOpenId] = useState("");
  const bins = model.binRequests.filter((b) => b.status === "Pending");
  const list = groups[tab];

  return (
    <>
      <PageHeader eyebrow="Requests" title="Requests" sub="Move pickups through their stages, assign crews and review each request's history." />
      <div className="grid grid-cols-3 rounded-lg border bg-muted p-1 sm:inline-grid sm:w-auto">
        {(["pending", "active", "closed"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-1.5 text-sm capitalize text-muted-foreground", tab === k && "bg-card font-medium text-foreground")}>
            {k} <span className="font-mono text-xs text-muted-foreground">{groups[k].length}</span>
          </button>
        ))}
      </div>
      <Panel title="Pickup requests" meta={String(list.length)} flush>
        {list.length === 0 ? (
          <div className="p-5"><Empty>No {tab} pickup requests.</Empty></div>
        ) : (
          <ul className="divide-y">
            {list.map(({ pickup, customer }) => {
              const crew = model.crews.find((c) => c.id === pickup.crew);
              const open = openId === pickup.id;
              const history = [{ status: "Requested", time: pickup.created, note: `Reserved ${money(pickup.amount)}` }, ...(pickup.history ?? [])];
              return (
                <li key={pickup.id} className="px-4 py-4 sm:px-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{customer.name} <span className="font-mono text-[11px] font-normal text-muted-foreground">{pickup.id}</span></p>
                      <p className="truncate text-sm text-muted-foreground">{customer.address}, {customer.area}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{pickup.window} · {money(pickup.amount)}{crew ? ` · ${crew.name}` : ""}</p>
                    </div>
                    <Chip label={pickup.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {pickup.status === "Requested" ? (
                      <>
                        <Button size="sm" className="btn-heat" onClick={() => setAcceptTarget(pickup)}>Accept & assign</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeclineTarget(pickup)}>Decline</Button>
                      </>
                    ) : null}
                    {["Scheduled", "Collected"].includes(pickup.status) ? (
                      <>
                        <select
                          aria-label="Assigned crew"
                          value={pickup.crew ?? ""}
                          onChange={(e) => { assignCrew(pickup.id, e.target.value); toast.success("Crew reassigned"); }}
                          className="h-10 rounded-md border border-input bg-background px-2 text-sm lg:h-8"
                        >
                          {model.crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {pickup.status === "Scheduled" ? (
                          <Button size="sm" variant="outline" onClick={() => { setPickupStatus(pickup.id, "Collected", "Waste collected by crew"); toast.success(`${pickup.id} marked collected`); }}>Mark collected</Button>
                        ) : null}
                        <Button size="sm" className="btn-heat" onClick={() => { setPickupStatus(pickup.id, "Completed"); toast.success(`${pickup.id} completed · earnings captured`); }}>Complete</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setPickupStatus(pickup.id, "Cancelled", "Cancelled by partner"); toast(`${pickup.id} cancelled · customer refunded`); }}>Cancel</Button>
                      </>
                    ) : null}
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setOpenId(open ? "" : pickup.id)}>
                      {open ? "Hide history" : `History · ${history.length}`}
                    </Button>
                  </div>
                  {open ? (
                    <ol className="mt-3 space-y-3 border-t pt-3">
                      {history.map((h, i) => (
                        <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                          <span className="mt-1.5 size-2 rounded-full bg-heat" />
                          <div className="min-w-0">
                            <p className="text-sm"><span className="font-medium">{h.status}</span>{h.note ? <span className="text-muted-foreground"> · {h.note}</span> : null}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{h.time}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <Panel title="Bin allocation requests" meta={String(bins.length)} flush>
        {bins.length === 0 ? (
          <div className="p-5"><Empty>No pending bin requests.</Empty></div>
        ) : (
          <ul className="divide-y">
            {bins.map((req) => {
              const c = model.customers.find((x) => x.id === req.customerId);
              return (
                <li key={req.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c?.name ?? req.customerId}</p>
                    <p className="text-sm text-muted-foreground">{c?.address}, {c?.area}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{req.size} L · {req.time}</p>
                  </div>
                  <Chip label={req.kind === "new" ? "New bin" : "Additional bin"} tone="neutral" />
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-heat" onClick={() => { approveBinRequest(req.id); toast.success(`Bin approved for ${c?.name ?? "customer"} · delivery scheduled`); }}>
                      Approve & deliver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setBinDecline(req.id)}>Decline</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <AcceptDialog
        pickup={acceptTarget}
        onClose={() => setAcceptTarget(null)}
        onConfirm={(crew, slot) => { if (acceptTarget) { acceptRequest(acceptTarget.id, crew, slot); toast.success(`${acceptTarget.id} accepted for ${slot}`); } setAcceptTarget(null); }}
      />
      <DeclineDialog
        open={!!declineTarget}
        title={declineTarget ? `Decline ${declineTarget.id}` : "Decline"}
        onClose={() => setDeclineTarget(null)}
        onConfirm={(r) => { if (declineTarget) { declineRequest(declineTarget.id, r); toast(`${declineTarget.id} declined · reservation returned`); } setDeclineTarget(null); }}
      />
      <DeclineDialog
        open={!!binDecline}
        title="Decline bin request"
        onClose={() => setBinDecline("")}
        onConfirm={(r) => { declineBinRequest(binDecline, r); toast("Bin request declined"); setBinDecline(""); }}
      />
    </>
  );
}

function AcceptDialog({ pickup, onClose, onConfirm }: { pickup: Pickup | null; onClose: () => void; onConfirm: (crew: string, slot: string) => void }) {
  const { model } = useStore();
  const [crew, setCrew] = useState("");
  const [slot, setSlot] = useState("");
  const chosenCrew = crew || model.crews[0]?.id || "";
  const chosenSlot = slot || pickup?.window || "";
  return (
    <Dialog open={!!pickup} onOpenChange={(o) => { if (!o) { onClose(); setCrew(""); setSlot(""); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Accept {pickup?.id}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Assign crew</Label>
          {model.crews.map((c) => (
            <button
              key={c.id}
              onClick={() => setCrew(c.id)}
              className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left hover:bg-accent", chosenCrew === c.id && "border-heat bg-heat-soft")}
            >
              <div>
                <p className="text-sm font-medium">{c.name} · <span className="font-mono text-xs">{c.plate}</span></p>
                <p className="text-xs text-muted-foreground">{c.members.join(" · ")}</p>
              </div>
              {chosenCrew === c.id ? <Chip label="Selected" tone="heat" /> : null}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slot">Time slot</Label>
          <Input id="slot" value={chosenSlot} onChange={(e) => setSlot(e.target.value)} placeholder="e.g. Friday, 9 am–noon" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="btn-heat" disabled={!chosenCrew || !chosenSlot.trim()} onClick={() => { onConfirm(chosenCrew, chosenSlot.trim()); setCrew(""); setSlot(""); }}>
            Confirm accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeclineDialog({ open, title, onClose, onConfirm }: { open: boolean; title: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Let the customer know why" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(reason.trim() || "Unable to fulfil at this time"); setReason(""); }}>Confirm decline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
