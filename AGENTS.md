# Partner app instructions

- Preserve published Git history; use normal commits and pushes.
- Partner console state lives in src/lib/store.tsx, one dataset per demo partner account (seedFor scopes customers by service area), saved to browser storage; the app renders only after the store loads in the browser to avoid server/browser mismatches. Account switching is demo-only, not security.
- Visual language follows the SmartWaste360 management workspace (neutral greys, hairline borders, Geist/Geist Mono, LAWMA orange accent); shared pieces live in src/components/partner.
- AI security review runs server-side (src/lib/security.functions.ts -> security-ai.server.ts) via a directly configured OpenAI Responses API with structured output; only sign-in metadata is sent, never passwords. The server function is public (no real auth yet), so input is size-limited.
- Fleet telemetry is simulated in src/lib/fleet.ts (checkCompliance holds the regulation rules); the MapLibre map (OpenFreeMap tiles) is lazy-loaded client-only because it needs browser APIs.
- Message attachments are stored inline as data URLs in browser storage, so they are capped at 1.5 MB; remittance PDFs are built in the browser with jsPDF (src/lib/receipt.ts).
