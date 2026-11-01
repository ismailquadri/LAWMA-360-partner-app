import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Host = createContext<HTMLDivElement | null>(null);
export function SheetHost({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return <Host.Provider value={host}><div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
    {children}
    <div ref={setHost} style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', overflow: 'hidden' }} />
  </div></Host.Provider>;
}
export function SheetOverlay({ visible, onClose, reduced, title, children }: { visible: boolean; onClose: () => void; reduced: boolean; title: string; children: React.ReactNode }) {
  const host = useContext(Host);
  const [mounted, setMounted] = useState(visible);
  const dialog = useRef<HTMLDivElement>(null);
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    if (visible) return;
    const timer = setTimeout(() => setMounted(false), reduced ? 0 : 220);
    return () => clearTimeout(timer);
  }, [visible, reduced]);
  useEffect(() => {
    if (!mounted || !host) return;
    const previous = document.activeElement as HTMLElement | null;
    const siblings = Array.from(host.parentElement?.children ?? []).filter(el => el !== host) as HTMLElement[];
    const previousInert = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    dialog.current?.focus();
    return () => { siblings.forEach((el, i) => { el.inert = previousInert[i]; }); previous?.focus(); };
  }, [mounted, host]);
  if (!host || !mounted) return null;
  return createPortal(<div ref={dialog} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
    data-sheet-state={visible ? 'open' : 'closed'}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key !== 'Tab') return;
      const targets = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]') ?? []);
      const first = targets[0], last = targets[targets.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    }}
    style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: visible ? 'auto' : 'none', outline: 'none', overflow: 'hidden' }}>
    <style>{`
      @keyframes phone-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes phone-sheet-out { from { transform: translateY(0); } to { transform: translateY(100%); } }
      @keyframes phone-shade-in { from { opacity: 0; } to { opacity: 1; } }
      [data-sheet-state="open"] [data-testid="sheet-panel"] { animation: phone-sheet-in ${reduced ? 0 : 300}ms cubic-bezier(.2,.8,.2,1) both; }
      [data-sheet-state="closed"] [data-testid="sheet-panel"] { animation: phone-sheet-out ${reduced ? 0 : 220}ms ease-in both; }
      [data-sheet-state="open"] [data-testid="sheet-shade"] { animation: phone-shade-in ${reduced ? 0 : 220}ms both; }
      [data-sheet-state="closed"] [data-testid="sheet-shade"] { opacity: 0; transition: opacity ${reduced ? 0 : 220}ms; }
    `}</style>
    {children}
  </div>, host);
}
