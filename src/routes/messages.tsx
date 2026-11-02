import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, FileText, Paperclip, Send, X } from "lucide-react";
import { useStore, type Attachment } from "@/lib/store";
import { pageHead } from "@/lib/meta";
import { PageHeader } from "@/components/partner/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: pageHead("Messages", "Conversations with your customers and the LAWMA revenue team."),
  component: Messages,
});

function Messages() {
  const { model, sendMessageToCustomer, sendMessageToLawma } = useStore();
  const [active, setActive] = useState("lawma");
  const [mobileThread, setMobileThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<Attachment | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const pick = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_BYTES) { toast.error("Files must be 1.5 MB or smaller."); return; }
    const r = new FileReader();
    r.onload = () => setFile({ name: f.name, type: f.type || "application/octet-stream", size: f.size, dataUrl: String(r.result) });
    r.readAsDataURL(f);
  };
  const threads = model.customers.filter((c) => c.supportMessages.length > 0);
  const customer = active !== "lawma" ? model.customers.find((c) => c.id === active) : undefined;
  // In the LAWMA thread, the partner's own messages carry role "customer".
  const messages = customer ? customer.supportMessages : model.lawmaThread;
  const mine = (role: string) => (customer ? role === "assistant" : role === "customer");

  const send = () => {
    const t = draft.trim();
    if (!t && !file) return;
    const att = file ?? undefined;
    if (customer) sendMessageToCustomer(customer.id, t, att);
    else sendMessageToLawma(t, att);
    setDraft(""); setFile(null);
  };

  const item = (id: string, name: string, last: string, tag?: string) => (
    <button key={id} onClick={() => { setActive(id); setMobileThread(true); }} className={cn("min-h-16 w-full touch-manipulation border-b px-4 py-3 text-left hover:bg-accent active:bg-accent", active === id && "bg-accent")}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{name}</p>
        {tag ? <span className="rounded bg-heat-soft px-1.5 font-mono text-[10px] text-heat-text">{tag}</span> : null}
      </div>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{last}</p>
    </button>
  );

  return (
    <>
      <PageHeader eyebrow="Messages" title="Messages" sub="Reply to customers and keep in touch with LAWMA." />
      <div className="grid h-[calc(100dvh-18rem)] min-h-[420px] overflow-hidden rounded-xl border bg-card md:h-[620px] md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={cn("overflow-y-auto md:block md:border-r", mobileThread && "hidden")}>
          {item("lawma", "LAWMA revenue team", model.lawmaThread.at(-1)?.text ?? "", "Authority")}
          {threads.map((c) => item(c.id, c.name, c.supportMessages.at(-1)?.text ?? ""))}
        </aside>
        <section className={cn("min-h-0 flex-col md:flex", mobileThread ? "flex" : "hidden")}>
          <div className="flex items-center gap-2 border-b px-4 py-3 sm:px-5">
            <button aria-label="Back to conversations" onClick={() => setMobileThread(false)} className="-ml-2 grid size-10 place-items-center rounded-md hover:bg-accent md:hidden">
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{customer?.name ?? "LAWMA revenue team"}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{customer ? `${customer.address}, ${customer.area}` : "Settlements · compliance"}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4 sm:p-5">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", mine(m.role) ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2 text-sm", mine(m.role) ? "bg-inverse text-inverse-foreground" : "border bg-card")}>
                  {m.attachment ? <AttachmentView a={m.attachment} mine={mine(m.role)} /> : null}
                  {m.text ? <p className={cn(m.attachment && "mt-2")}>{m.text}</p> : null}
                  {m.time ? <p className={cn("mt-1 font-mono text-[10px]", mine(m.role) ? "text-inverse-muted" : "text-muted-foreground")}>{m.time}</p> : null}
                </div>
              </div>
            ))}
          </div>
          {file ? (
            <div className="flex items-center gap-2 border-t px-3 pt-3 text-sm">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{kb(file.size)}</span>
              <button aria-label="Remove attachment" onClick={() => setFile(null)} className="grid size-9 place-items-center rounded-md hover:bg-accent"><X className="size-4" /></button>
            </div>
          ) : null}
          <form className={cn("flex gap-2 p-3", !file && "border-t")} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input ref={picker} type="file" hidden accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
            <Button type="button" variant="outline" className="h-11 w-11 shrink-0 sm:h-9 sm:w-9" aria-label="Attach photo or document" onClick={() => picker.current?.click()}><Paperclip className="size-4" /></Button>
            <Input enterKeyHint="send" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" />
            <Button type="submit" className="btn-heat h-11 w-11 shrink-0 sm:h-9 sm:w-9" disabled={!draft.trim() && !file} aria-label="Send"><Send className="size-4" /></Button>
          </form>
        </section>
      </div>
    </>
  );
}

const MAX_BYTES = 1.5 * 1024 * 1024;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function AttachmentView({ a, mine }: { a: Attachment; mine: boolean }) {
  if (a.type.startsWith("image/")) return <a href={a.dataUrl} download={a.name}><img src={a.dataUrl} alt={a.name} className="max-h-60 rounded-lg" /></a>;
  if (a.type.startsWith("video/")) return <video src={a.dataUrl} controls className="max-h-60 rounded-lg" />;
  return (
    <a href={a.dataUrl} download={a.name} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", mine ? "border-inverse-muted/30" : "bg-background")}>
      <FileText className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{a.name}</span>
      <span className={cn("font-mono text-[10px]", mine ? "text-inverse-muted" : "text-muted-foreground")}>{kb(a.size)}</span>
    </a>
  );
}
