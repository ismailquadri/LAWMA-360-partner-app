import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Lock, EyeOff, ShieldAlert, AlertTriangle } from "lucide-react";
import type { NdaRecord } from "./EvaluationAccessWall";

interface ScreenSecurityShieldProps {
  children: ReactNode;
  record: NdaRecord | null;
}

export function ScreenSecurityShield({ children, record }: ScreenSecurityShieldProps) {
  // Screen obscuring state (for window blur / screen sharing / tab switching)
  const [isObscured, setIsObscured] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [screenshotNotice, setScreenshotNotice] = useState(false);

  // 1. Meeting & Screen Share Obfuscation (Window Blur / Inactive Window)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleBlur = () => {
      // Small debounce (150ms) to avoid false positives during swift intra-window clicks
      timeoutId = setTimeout(() => {
        setIsObscured(true);
      }, 150);
    };

    const handleFocus = () => {
      clearTimeout(timeoutId);
      setIsObscured(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
      } else {
        setIsObscured(false);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 2. Keyboard Interceptions (PrintScreen, DevTools, Save, Print)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // A. Intercept PrintScreen (Windows/Linux)
    if (e.key === "PrintScreen" || e.code === "PrintScreen") {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            "CONFIDENTIAL EVALUATION RECORD — SCREENSHOT PROHIBITED UNDER SPARKR DIGITALS NDA-2026-8234"
          );
        }
      } catch (err) {
        console.warn("Clipboard access restricted", err);
      }
      setScreenshotNotice(true);
      setTimeout(() => setScreenshotNotice(false), 3500);
      return;
    }

    // B. Prevent Print dialog (Cmd/Ctrl + P)
    if (cmdOrCtrl && (e.key === "p" || e.key === "P")) {
      e.preventDefault();
      setScreenshotNotice(true);
      setTimeout(() => setScreenshotNotice(false), 3500);
      return;
    }

    // C. Prevent Save Page (Cmd/Ctrl + S)
    if (cmdOrCtrl && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      return;
    }

    // D. Prevent View Source (Cmd/Ctrl + U)
    if (cmdOrCtrl && (e.key === "u" || e.key === "U")) {
      e.preventDefault();
      return;
    }

    // E. Prevent DevTools shortcuts (F12 or Cmd/Ctrl + Shift + I / C / J)
    if (
      e.key === "F12" ||
      (cmdOrCtrl && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c" || e.key === "J" || e.key === "j"))
    ) {
      e.preventDefault();
      setDevToolsOpen(true);
      return;
    }
  }, []);

  // 3. Right-Click / Context Menu Suppression
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleKeyDown, handleContextMenu]);

  // 4. DevTools Active Sizing Detection
  useEffect(() => {
    const threshold = 160;
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    window.addEventListener("resize", checkDevTools);
    return () => window.removeEventListener("resize", checkDevTools);
  }, []);

  // Watermark text formulation
  const watermarkText = record
    ? `${record.fullName.toUpperCase()} · ${record.email} · ${record.organisation.toUpperCase()} · NDA-2026-8234 · STRICTLY CONFIDENTIAL`
    : "SPARKR DIGITALS · CONFIDENTIAL EVALUATION · NDA-2026-8234 · DO NOT RECORD";

  return (
    <div className="relative min-h-screen select-none">
      {/* Dynamic Print Suppression Styles */}
      <style>{`
        @media print {
          body * {
            display: none !important;
            visibility: hidden !important;
          }
          body:after {
            content: "CONFIDENTIAL EVALUATION MATERIAL — PRINTING PROHIBITED UNDER NIGERIAN COPYRIGHT ACT 2022 & NDA-2026-8234 (SPARKR DIGITALS)";
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: fixed !important;
            inset: 0 !important;
            background: #000000 !important;
            color: #ffffff !important;
            font-size: 16px !important;
            font-weight: bold !important;
            text-align: center !important;
            padding: 40px !important;
          }
        }
      `}</style>

      {/* Render Protected Content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* 5. Forensic Dynamic Tiled Watermark (Permanent anti-camera / anti-recording watermark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden opacity-[0.045] dark:opacity-[0.065] select-none print:hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gridAutoRows: "180px",
          gap: "40px",
          padding: "20px",
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center transform -rotate-[24deg] text-[11px] font-mono font-bold tracking-wider text-black dark:text-white uppercase whitespace-nowrap text-center"
          >
            {watermarkText}
          </div>
        ))}
      </div>

      {/* 6. Screenshot / Copy Warning Toast */}
      {screenshotNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999999] flex items-center gap-3 rounded-2xl border border-red-500/40 bg-zinc-950/95 px-5 py-3 text-red-200 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <ShieldAlert className="size-5 shrink-0 text-red-400" />
          <div className="text-xs">
            <p className="font-semibold text-red-300">Screen Capture Prohibited</p>
            <p className="text-zinc-400">Screenshots and recording are strictly prohibited under your executed NDA.</p>
          </div>
        </div>
      )}

      {/* 7. DevTools Open Blackout */}
      {devToolsOpen && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/98 p-6 text-center text-zinc-100 backdrop-blur-3xl">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Inspection Tools Detected
          </h2>
          <p className="max-w-md text-sm text-zinc-400 mb-6">
            Developer tools and code inspection are strictly disabled in this evaluation environment.
            Please close Developer Tools to resume platform evaluation.
          </p>
          <button
            onClick={() => setDevToolsOpen(false)}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Dismiss / I have closed tools
          </button>
        </div>
      )}

      {/* 8. Meeting Screen Share & Window Inactivity Obfuscation Shield */}
      {isObscured && (
        <div
          onClick={() => setIsObscured(false)}
          className="fixed inset-0 z-[999998] flex flex-col items-center justify-center bg-black/98 p-6 text-center text-zinc-100 backdrop-blur-3xl cursor-pointer"
        >
          <div className="size-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-xl">
            <EyeOff className="size-8 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-mono text-emerald-400 mb-3">
            <Lock className="size-3" />
            Meeting Privacy Shield Active
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Platform Display Protected
          </h2>
          <p className="max-w-md text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            Content is obscured to prevent unauthorized screen sharing during video calls or background recording.
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors">
            Click anywhere or focus window to resume
          </div>
        </div>
      )}
    </div>
  );
}
