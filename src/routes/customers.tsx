import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACCOUNTS } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { toast } from "sonner";
import { money, useStore, type Customer } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { Chip, Empty, PageHeader, Panel, Td, Th } from "@/components/partner/kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/customers")({
  head: pageHead("Customers", "Customers, bins, wallets and pickup history across your service areas."),
  component: Customers,
});

function Customers() {
  const { model, customerById, resolveIssue } = useStore();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? model.customers.filter((c) => `${c.name} ${c.address} ${c.area}`.toLowerCase().includes(t)) : model.customers;
  }, [model.customers, q]);
  const open = customerById(openId);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader eyebrow="Customers" title="Customers" sub={`${model.customers.length} customers across your service areas.`}
        actions={<Button className="btn-heat" onClick={() => setAdding(true)}><UserPlus className="size-4" />Onboard customer</Button>} />
      <OnboardDialog open={adding} onOpenChange={setAdding} onDone={(id) => setOpenId(id)} />
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, address or area" />
      </div>
      <Panel flush>
        {list.length === 0 ? (
          <div className="p-5"><Empty>No matching customers.</Empty></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr><Th>Name</Th><Th>Address</Th><Th>Bins</Th><Th className="text-right">Wallet</Th><Th className="text-right">Status</Th></tr>
              </thead>
              <tbody className="divide-y">
                {list.map((c) => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer hover:bg-accent">
                    <Td><p className="font-medium">{c.name}</p><p className="font-mono text-[11px] text-muted-foreground">{c.id}</p></Td>
                    <Td className="text-muted-foreground">{c.address}, {c.area}</Td>
                    <Td className="font-mono">{c.bins.length}</Td>
                    <Td className="text-right font-mono tabular-nums">{money(c.balance)}</Td>
                    <Td className="text-right"><Chip label={c.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId("")}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open ? (
            <>
              <SheetHeader><SheetTitle>{open.name}</SheetTitle></SheetHeader>
              <CustomerDetail customer={open} onResolve={(i, r) => { resolveIssue(open.id, i, r); toast.success(`${i} resolved`); }} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="eyebrow mb-3 text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function CustomerDetail({ customer, onResolve }: { customer: Customer; onResolve: (issueId: string, reply: string) => void }) {
  const [replies, setReplies] = useState<Record<string, string>>({});
  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{customer.address}, {customer.area} · {customer.phone}</p>
        <Chip label={customer.status} />
      </div>
      <Block title="Wallet">
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-muted-foreground">Balance</p><p className="font-mono text-lg">{money(customer.balance)}</p></div>
          <div><p className="text-xs text-muted-foreground">Reserved</p><p className="font-mono text-lg">{money(customer.reserved)}</p></div>
        </div>
      </Block>
      <Block title="Bins">
        {customer.bins.length === 0 ? <p className="text-sm text-muted-foreground">No bins allocated yet.</p> : (
          <ul className="space-y-2">{customer.bins.map((b) => <li key={b.id} className="flex justify-between text-sm"><span className="font-mono">{b.id} · {b.size} L</span><Chip label={b.state} /></li>)}</ul>
        )}
      </Block>
      <Block title="Pickup history">
        {customer.pickups.length === 0 ? <p className="text-sm text-muted-foreground">No pickups yet.</p> : (
          <ul className="space-y-3">{customer.pickups.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-3">
              <div><p className="font-mono text-sm">{p.id} · {money(p.amount)}</p><p className="text-xs text-muted-foreground">{p.window} · {p.created}</p></div>
              <Chip label={p.status} />
            </li>
          ))}</ul>
        )}
      </Block>
      <Block title="Wallet activity">
        {customer.entries.length === 0 ? <p className="text-sm text-muted-foreground">No wallet activity yet.</p> : (
          <ul className="space-y-2">{customer.entries.slice(0, 8).map((e) => <li key={e.id}><p className="text-sm">{e.title}</p><p className="font-mono text-[11px] text-muted-foreground">{e.time}</p></li>)}</ul>
        )}
      </Block>
      <Block title="Issues">
        {customer.issues.length === 0 ? <p className="text-sm text-muted-foreground">No issues reported.</p> : (
          <ul className="space-y-4">{customer.issues.map((i) => (
            <li key={i.id} className="space-y-2">
              <div className="flex justify-between gap-3"><p className="text-sm font-medium">{i.type} <span className="font-mono text-[11px] text-muted-foreground">{i.id}</span></p><Chip label={i.status} /></div>
              <p className="text-sm text-muted-foreground">{i.detail}</p>
              {i.status !== "Resolved" ? (
                <div className="flex gap-2">
                  <Input value={replies[i.id] ?? ""} onChange={(e) => setReplies({ ...replies, [i.id]: e.target.value })} placeholder="Resolution note" />
                  <Button size="sm" className="btn-heat" onClick={() => onResolve(i.id, replies[i.id]?.trim() || "Resolved by partner")}>Resolve</Button>
                </div>
              ) : i.reply ? <p className="text-xs text-forest-text">Reply: {i.reply}</p> : null}
            </li>
          ))}</ul>
        )}
      </Block>
    </div>
  );
}

function OnboardDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: (id: string) => void }) {
  const { addCustomer } = useStore();
  const { account } = useAccount();
  const areas = (ACCOUNTS.find((a) => a.id === account.id) ?? account).areas;
  const blank = { name: "", phone: "", address: "", area: areas[0]!, bin: "240" };
  const [f, setF] = useState(blank);
  const phoneOk = /^0[789][01]\d{8}$/.test(f.phone.replace(/\s/g, ""));
  const ok = f.name.trim().length >= 2 && f.address.trim().length >= 3 && phoneOk;
  const submit = () => {
    const c = addCustomer({ name: f.name, phone: f.phone, address: f.address, area: f.area, ...(f.bin !== "none" ? { binSize: Number(f.bin) } : {}) });
    toast.success(`${c.name} onboarded${f.bin !== "none" ? " · bin request added to Requests" : ""}`);
    setF(blank); onOpenChange(false); onDone(c.id);
  };
  const field = "flex flex-col gap-1.5 text-sm";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Onboard a customer</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (ok) submit(); }}>
          <label className={field}><span className="eyebrow text-muted-foreground">Full name</span><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Bisi Adeyemi" autoComplete="name" /></label>
          <label className={field}><span className="eyebrow text-muted-foreground">Phone</span><Input inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0803 000 0000" />
            {f.phone && !phoneOk ? <span className="text-xs text-crimson-text">Enter an 11-digit Nigerian mobile number.</span> : null}</label>
          <label className={field}><span className="eyebrow text-muted-foreground">Street address</span><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="12 Admiralty Way" autoComplete="street-address" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={field}><span className="eyebrow text-muted-foreground">Service area</span>
              <select className="h-11 rounded-md border bg-background px-3 text-sm sm:h-9" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value as Customer["area"] })}>
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select></label>
            <label className={field}><span className="eyebrow text-muted-foreground">Smart bin</span>
              <select className="h-11 rounded-md border bg-background px-3 text-sm sm:h-9" value={f.bin} onChange={(e) => setF({ ...f, bin: e.target.value })}>
                <option value="120">120 L</option><option value="240">240 L</option><option value="none">No bin yet</option>
              </select></label>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="btn-heat" disabled={!ok}>Onboard customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
