import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { PageHeader, Panel } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: pageHead("Settings", "Partner profile, service areas and notification preferences."),
  component: Settings,
});

function Settings() {
  const { model, updateProfile, reset } = useStore();
  const [form, setForm] = useState(model.profile);
  const [confirm, setConfirm] = useState(false);
  const toggles = [
    ["notifyRequests", "New pickup and bin requests"],
    ["notifyMessages", "Customer and LAWMA messages"],
    ["notifyRemittance", "Remittance reminders"],
  ] as const;

  return (
    <>
      <PageHeader eyebrow="Settings" title="Settings" sub="Your partner profile and notification preferences." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Partner profile">
          <div className="space-y-4">
            {([["name", "Company name"], ["areas", "Service areas"], ["contact", "Contact"]] as const).map(([k, label]) => (
              <div key={k} className="space-y-2">
                <Label htmlFor={k}>{label}</Label>
                <Input id={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <Button className="btn-heat" onClick={() => { updateProfile(form); toast.success("Profile saved"); }}>Save changes</Button>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Notifications" flush>
            <ul className="divide-y">
              {toggles.map(([k, label]) => (
                <li key={k} className="flex items-center justify-between px-5 py-3.5">
                  <Label htmlFor={k}>{label}</Label>
                  <Switch id={k} checked={form[k]} onCheckedChange={(v) => { setForm({ ...form, [k]: v }); updateProfile({ [k]: v }); }} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Demonstration data">
            <p className="mb-4 text-sm text-muted-foreground">Restore the sample customers, requests and balances.</p>
            <Button variant="outline" onClick={() => setConfirm(true)}>Reset demonstration</Button>
          </Panel>
        </div>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset demonstration?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">All changes you made will be replaced with the original sample data.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { reset(); setConfirm(false); window.location.reload(); }}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
