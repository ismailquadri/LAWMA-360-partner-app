import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import home from "@/assets/onboarding-home.jpg.asset.json";
import collection from "@/assets/onboarding-collection.jpg.asset.json";
import delivery from "@/assets/onboarding-delivery.jpg.asset.json";
import { ACCOUNTS } from "@/lib/store";
import { recordSignIn } from "@/lib/signins";
import { LawmaMark } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const slides = [
  { img: home.url, eyebrow: "01 · Requests", title: "Every pickup, in one queue", body: "Accept, schedule and assign crews to customer requests the moment they arrive." },
  { img: collection.url, eyebrow: "02 · Operations", title: "Routes your crews can follow", body: "Track each stop from scheduled to collected to completed, right from the street." },
  { img: delivery.url, eyebrow: "03 · Finance", title: "Clear earnings, easy remittance", body: "See your 80% share, what's due to LAWMA, and remit in two taps." },
];

export const DEMO_EMAILS: Record<string, string> = { mainland: "ops@mainlandclean.ng", coastal: "desk@coastalgreen.ng" };

export function Onboarding({ onLogin, skipIntro }: { onLogin: (accountId: string) => void; skipIntro?: boolean }) {
  const [step, setStep] = useState(skipIntro ? slides.length : 0);
  const touchX = useRef<number | null>(null);
  const atLogin = step >= slides.length;
  const go = (n: number) => setStep(Math.max(0, Math.min(slides.length, n)));

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Picture side: full-bleed on desktop, top half on mobile intro */}
      <div
        className={cn("relative overflow-hidden bg-inverse", atLogin ? "hidden lg:block" : "h-[52dvh] lg:h-auto")}
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(dx) > 40) go(step + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {slides.map((s, i) => (
          <img
            key={s.img}
            src={s.img}
            alt=""
            className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", (atLogin ? i === 0 : i === step) ? "opacity-100" : "opacity-0")}
          />
        ))}
        <div className="absolute top-5 left-5 flex items-center gap-2 rounded-lg bg-surface py-1.5 pr-3 pl-1.5">
          <LawmaMark className="size-7" />
          <span className="display text-base">LAWMA 360</span>
        </div>
      </div>

      <div className="flex flex-col px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 lg:justify-center lg:px-16">
        {!atLogin ? (
          <div className="flex flex-1 flex-col lg:flex-none">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5" role="tablist" aria-label="Onboarding steps">
                {slides.map((_, i) => (
                  <button key={i} role="tab" aria-selected={i === step} aria-label={`Step ${i + 1}`} onClick={() => go(i)} className="flex h-6 items-center">
                    <span className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-heat" : "w-1.5 bg-input")} />
                  </button>
                ))}
              </div>
              <button onClick={() => go(slides.length)} className="h-10 px-2 text-sm text-muted-foreground hover:text-foreground">Skip</button>
            </div>
            <div key={step} className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="eyebrow text-heat-text">{slides[step]!.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{slides[step]!.title}</h1>
              <p className="mt-3 max-w-md text-muted-foreground">{slides[step]!.body}</p>
            </div>
            <div className="mt-auto flex gap-3 pt-8 lg:mt-10">
              {step > 0 ? (
                <Button variant="outline" size="lg" className="h-12 w-12 p-0" aria-label="Back" onClick={() => go(step - 1)}><ArrowLeft className="size-4" /></Button>
              ) : null}
              <Button size="lg" className="btn-heat h-12 flex-1 lg:flex-none lg:px-8" onClick={() => go(step + 1)}>
                {step === slides.length - 1 ? "Get started" : "Next"} <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Login onLogin={onLogin} onBack={() => go(0)} />
        )}
      </div>
    </div>
  );
}

function Login({ onLogin, onBack }: { onLogin: (id: string) => void; onBack: () => void }) {
  const [accountId, setAccountId] = useState(ACCOUNTS[0]!.id);
  const [email, setEmail] = useState(DEMO_EMAILS[ACCOUNTS[0]!.id]!);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid work email.");
    if (password.length < 4) {
      recordSignIn(accountId, email, "failed");
      return setError("Password must be at least 4 characters.");
    }
    setError("");
    setBusy(true);
    setTimeout(() => onLogin(accountId), 600);
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm animate-in fade-in duration-500 lg:mx-0">
      <div className="flex items-center gap-2.5 lg:hidden">
        <LawmaMark className="size-10" />
        <span className="display text-lg">LAWMA 360</span>
      </div>
      <p className="eyebrow mt-8 text-heat-text lg:mt-0">Partner console</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your PSP operator account to manage requests, crews and remittance.</p>

      <div className="mt-8 space-y-2">
        <Label>Partner</Label>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNTS.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => { setAccountId(a.id); setEmail(DEMO_EMAILS[a.id]!); }}
              className={cn("min-h-14 rounded-lg border px-3 py-2 text-left transition-colors active:scale-[0.99]", accountId === a.id ? "border-heat bg-heat-soft" : "hover:bg-accent")}
            >
              <p className="text-sm font-medium leading-tight">{a.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{a.areas.join(" · ")}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" autoComplete="email" className="h-12 sm:h-12" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mt-5 space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="h-12 pr-12 sm:h-12" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any 4+ characters in this demo" />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute top-0 right-0 grid h-12 w-12 place-items-center text-muted-foreground">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-crimson-text">{error}</p> : null}
      <Button type="submit" size="lg" disabled={busy} className="btn-heat mt-6 h-12 w-full">{busy ? "Signing in…" : "Sign in"}</Button>
      <button type="button" onClick={onBack} className="mt-4 h-10 w-full text-sm text-muted-foreground hover:text-foreground">Replay introduction</button>
      <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">Demo sign-in: no real accounts are checked.</p>
    </form>
  );
}
