import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { buildRemittancePdf, deliverFile } from "@/lib/receipt";
import { money, useStore, type Settlement } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { Empty, Kpi, PageHeader, Panel, Td, Th } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/finance")({
  head: pageHead("Finance", "Earnings ledger, 80/20 revenue split and remittance to LAWMA."),
  component: Finance,
});

const PARTNER_PCT = 80;

function Finance() {
  const { model, remitToLawma } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState<Settlement | null>(null);
  const [busy, setBusy] = useState("");
  const download = async (s: Settlement) => {
    setBusy(s.ref);
    try { await deliverFile(await buildRemittancePdf(s, model.profile), `LAWMA-remittance-${s.ref}.pdf`); }
    catch { toast.error("Couldn't create the receipt. Please try again."); }
    finally { setBusy(""); }
  };
  const dl = (s: Settlement, label = true) => (
    <Button variant="outline" size="sm" disabled={busy === s.ref} onClick={() => download(s)} aria-label={`Download proof of remittance ${s.ref}`}>
      <Download className="size-4" />{label ? (busy === s.ref ? "Preparing…" : "Proof") : null}
    </Button>
  );
  const due = model.earningsUncaptured;
  const partnerShare = Math.round(due * (PARTNER_PCT / 100));
  const authorityShare = due - partnerShare;
  const ledger = model.customers
    .flatMap((c) => c.entries.filter((e) => e.kind === "paid" || e.title.toLowerCase().includes("bin")).map((e) => ({ ...e, customer: c.name })))
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 12);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Finance"
        sub="Earnings ledger, revenue split and remittance to LAWMA."
        actions={<Button className="btn-heat" disabled={due === 0} onClick={() => setConfirming(true)}>Remit to LAWMA</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Accumulated since last remittance" value={money(due)} accent={due > 0} />
        <Kpi label={`Partner share · ${PARTNER_PCT}%`} value={money(partnerShare)} sub={`Retained by ${model.profile.name}`} />
        <Kpi label={`Authority share · ${100 - PARTNER_PCT}%`} value={money(authorityShare)} sub="Owed to LAWMA" />
      </div>
      <Panel title="Earnings ledger" flush>
        {ledger.length === 0 ? <div className="p-5"><Empty>No captured earnings yet.</Empty></div> : (
          <>
          <ul className="divide-y sm:hidden">
            {ledger.map((e) => (
              <li key={e.id} className="px-4 py-3">
                <p className="text-sm font-medium">{e.customer}</p>
                <p className="text-sm text-muted-foreground">{e.title}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{e.time}</p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr><Th>Customer</Th><Th>Description</Th><Th className="text-right">Time</Th></tr></thead>
              <tbody className="divide-y">
                {ledger.map((e) => (
                  <tr key={e.id}><Td className="font-medium">{e.customer}</Td><Td>{e.title}</Td><Td className="text-right font-mono text-xs text-muted-foreground">{e.time}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Panel>
      <Panel title="Settlements history" meta={String(model.settlements.length)} flush>
        {model.settlements.length === 0 ? <div className="p-5"><Empty>No settlements yet.</Empty></div> : (
          <>
          <ul className="divide-y sm:hidden">
            {model.settlements.map((s) => (
              <li key={s.ref} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-sm font-medium">{s.ref}</p>
                  <p className="font-mono text-sm tabular-nums">{money(s.amount)}</p>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{s.date}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Partner {money(s.partnerShare)} · Authority {money(s.authorityShare)}</p>
                <div className="mt-2">{dl(s)}</div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr><Th>Reference</Th><Th>Date</Th><Th className="text-right">Amount</Th><Th className="text-right">Partner</Th><Th className="text-right">Authority</Th><Th className="text-right">Receipt</Th></tr></thead>
              <tbody className="divide-y font-mono tabular-nums">
                {model.settlements.map((s) => (
                  <tr key={s.ref}><Td className="font-medium">{s.ref}</Td><Td className="text-xs text-muted-foreground">{s.date}</Td><Td className="text-right">{money(s.amount)}</Td><Td className="text-right">{money(s.partnerShare)}</Td><Td className="text-right">{money(s.authorityShare)}</Td><Td className="text-right">{dl(s)}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Panel>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm remittance</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to remit <strong className="text-foreground">{money(due)}</strong> to LAWMA — {money(partnerShare)} partner share retained, {money(authorityShare)} authority share transferred. Your accumulated balance resets to zero.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button className="btn-heat" onClick={() => { setReceipt(remitToLawma()); setConfirming(false); }}>Confirm & remit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-forest" /> Remitted to LAWMA</DialogTitle></DialogHeader>
          {receipt ? (
            <dl className="divide-y rounded-lg border font-mono text-sm">
              {[["Reference", receipt.ref], ["Date", receipt.date], ["Amount", money(receipt.amount)], ["Partner share", money(receipt.partnerShare)], ["Authority share", money(receipt.authorityShare)]].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          ) : null}
          <DialogFooter>{receipt ? <Button variant="outline" disabled={busy === receipt.ref} onClick={() => download(receipt)}><Download className="size-4" />Download proof of remittance</Button> : null}<Button onClick={() => setReceipt(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
