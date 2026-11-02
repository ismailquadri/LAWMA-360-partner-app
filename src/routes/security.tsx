import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/lib/meta";
import { useAccount } from "@/lib/account";
import { addSignIn, describeDevice, loadSignIns, removeSignIn, type SignIn } from "@/lib/signins";
import { analyzeSecurity } from "@/lib/security.functions";
import type { SecurityReport } from "@/lib/security-ai.server";
import { DEMO_EMAILS } from "@/components/partner/Onboarding";
import { Chip, Empty, PageHeader, Panel } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/security")({
  head: pageHead("Account security", "Review partner sign-in activity and get an AI-powered explanation of suspicious access."),
  component: Security,
});

const riskTone = { low: "forest", medium: "honey", high: "crimson" } as const;
const fmt = (iso: string) => new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

function Security() {
  const { account } = useAccount();
  const email = DEMO_EMAILS[account.id] ?? "";
  const [events, setEvents] = useState<SignIn[]>([]);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const analyze = useServerFn(analyzeSecurity);
  const blank = { time: "", location: "", device: "", ip: "", result: "success" as SignIn["result"] };
  const [form, setForm] = useState(blank);

  const refresh = () => setEvents(loadSignIns(account.id, email));
  useEffect(() => { refresh(); }, [account.id, email]);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await analyze({
        data: { accountName: account.name, events: events.slice(0, 60).map(({ time, location, device, ip, result }) => ({ time, location, device, ip, result })) },
      });
      if ("error" in res && res.error) setError(res.error);
      else if ("report" in res) setReport(res.report);
    } catch {
      setError("The security check could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.time || !form.location.trim()) { toast.error("Add at least a date/time and location."); return; }
    addSignIn({ ...form, accountId: account.id, email, time: new Date(form.time).toISOString(), device: form.device.trim() || "Not provided", ip: form.ip.trim() || "Not provided", source: "added" });
    setForm(blank);
    refresh();
    toast.success("Sign-in added");
  };

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Account security"
        sub="Sign-in activity for this partner account. Run an AI check to spot suspicious access and get plain-language advice."
        actions={
          <Button className="btn-heat" disabled={busy || events.length === 0} onClick={run}>
            <Sparkles className="size-4" /> {busy ? "Analysing…" : "Check for risks"}
          </Button>
        }
      />

      {error ? <p role="alert" className="rounded-lg border border-crimson/30 bg-crimson-bg px-4 py-3 text-sm text-crimson-text">{error}</p> : null}

      {busy && !report ? (
        <Panel title="AI security review"><p className="animate-pulse text-sm text-muted-foreground">Reviewing {events.length} sign-ins for unusual patterns…</p></Panel>
      ) : null}

      {report ? (
        <Panel
          title="AI security review"
          {...(busy ? { meta: "refreshing…" } : {})}
          action={<Chip label={`${report.riskLevel} risk`} tone={riskTone[report.riskLevel]} />}
        >
          <p className="text-sm">{report.summary}</p>
          {report.findings.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-forest-text"><ShieldCheck className="size-4" /> No suspicious patterns found.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {report.findings.map((f, i) => (
                <li key={i} className="rounded-lg border p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="font-medium">{f.title}</p>
                    <Chip label={f.severity} tone={riskTone[f.severity]} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.explanation}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">Evidence: {f.evidence}</p>
                </li>
              ))}
            </ul>
          )}
          {report.recommendations.length ? (
            <div className="mt-5 border-t pt-4">
              <p className="eyebrow text-muted-foreground">What to do next</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </div>
          ) : null}
          <p className="mt-4 text-xs text-muted-foreground">AI-generated. Confirm anything serious with LAWMA support.</p>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Sign-in activity" meta={String(events.length)} flush>
          {events.length === 0 ? <div className="p-5"><Empty>No sign-ins recorded.</Empty></div> : (
            <ul className="divide-y">
              {events.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.location}</p>
                    <p className="truncate text-sm text-muted-foreground">{s.device}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{fmt(s.time)} · {s.ip}{s.source === "added" ? " · added by staff" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Chip label={s.result === "success" ? "Signed in" : "Failed"} tone={s.result === "success" ? "forest" : "crimson"} />
                    <Button size="sm" variant="ghost" className="w-10 px-0 lg:w-8" aria-label="Remove sign-in" onClick={() => { removeSignIn(s.id); refresh(); }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Add a sign-in">
          <form onSubmit={add} className="space-y-4">
            <p className="text-sm text-muted-foreground">Report a sign-in you know about, for example from another device. Never enter your password here.</p>
            <div className="space-y-2"><Label htmlFor="t">Date & time</Label><Input id="t" type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="l">Location</Label><Input id="l" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Yaba, Lagos" /></div>
            <div className="space-y-2">
              <Label htmlFor="d">Device</Label>
              <div className="flex gap-2">
                <Input id="d" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} placeholder="e.g. Chrome · Android" />
                <Button type="button" variant="outline" className="shrink-0" onClick={() => setForm({ ...form, device: describeDevice() })}>This device</Button>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="ip">IP address (optional)</Label><Input id="ip" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} /></div>
            <div className="grid grid-cols-2 rounded-lg border bg-muted p-1">
              {(["success", "failed"] as const).map((r) => (
                <button type="button" key={r} onClick={() => setForm({ ...form, result: r })} className={cn("h-10 rounded-md text-sm text-muted-foreground lg:h-8", form.result === r && "bg-card font-medium text-foreground")}>
                  {r === "success" ? "Signed in" : "Failed attempt"}
                </button>
              ))}
            </div>
            <Button type="submit" variant="outline" className="w-full">Add sign-in</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
