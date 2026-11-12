# Research: Operator & Field Crew Terminal (`Operator`)

**System Scope:** System 3 of 4 — Rugged Offline-First Crew Handheld, Tricycle Feeder, Supervisor Telemetry & Enforcement Field Terminal  
**Existing Codebase Audited:** `waste-scan-mate` (`/Users/quadri/Downloads/waste-scan-mate`)  
**Pilot Corridor:** Alimosho–Orile Agege–Agege TLS Lagos West Corridor  

---

## 1. Executive Summary & System Diagnosis

`waste-scan-mate` is the **physical proof-of-service sensor** of the entire 4-system architecture. Without tamper-resistant field scans recorded at the gate, *Partner* cannot prove route completion against the Saturday-noon SLA freeze, *Resident* cannot trust monthly escrow protection, and *LAWMA Workspace* cannot score **20 LGAs / 37 LCDAs** objectively or differentiate legitimate 3-day landfill delays from PSP abandonment.

Auditing `waste-scan-mate/src/routes/index.tsx` and `SupervisorDashboard.tsx` reveals strong foundational ergonomics tailored to harsh Lagos field realities—an explicit `Network` banner (`Depot Wi-Fi | 4G | 2G / Edge | Offline`), zero-touch camera tag scanning (`valid | arrears | already-collected | wrong-zone | damaged-tag`), multi-property framing (`Home | Flats | Shop | Office | School`), offline exception logging, a Crew Supervisor telemetry overlay (`Babatunde A.`, `Musa K.`, `Adaeze N.` with battery-swap and arrears-override auditing), and an `IPhone17Mockup` resident presentation switcher.

However, **six severe operational and architectural gaps** prevent the current terminal from executing the Lagos Solution Blueprint end-to-end:

1. **Missing From `hub-contract.ts` Event Architecture:** In `LAWMA-360-customer-app/src/lib/hub-contract.ts`, `APPS = ["customer", "partner", "lawma"] as const` omits `"operator"` altogether. `waste-scan-mate` generates no standardized payload that updates `Partner` RouteStops/escrow or `Workspace` fleet breadcrumbs.
2. **Compound / Multi-Flat Arrears Nuance Missing:** Current `arrears` screen assumes a binary paid/unpaid single property. In dense Alimosho compounds (`Flats`), if `6 of 8` units paid via Compound Split-Pay while `2` defaulted, turning away the truck triggers a street dumping crisis, whereas blindly overriding hides partial debtors.
3. **No Tricycle Micro-Collector / Zone Micro-Collector Workflow:** `waste-scan-mate` assumes every operator sits inside a full compactor truck running primary street stops—with no workflow for **Tricycle Compactors** or **reformed cart pushers ("Zone Micro-Collectors")** clearing narrow inner lanes (e.g., *Ikotun, Egbeda, Ayobo, Orile Agege*) and executing **Tricycle-to-Mother-Truck or Tricycle-to-Skip/TLS handoff scans**.
4. **No Tip-Off / TLS / Market Organic Verification:** A route today ends on the street without recording the **mid-mile closing event**: tipping at **Agege TLS (`FAC-AGE`)**, **Solous II (`DS-SOL`)**, or delivering pre-sorted market organics (`Ikotun`, `Igando`, `Ile-Epo`) to **Alimosho Organic Hub (`FAC-ORG-ALI`)**—leaving room for illegal bush/canal tipping after scanning residential bins.
5. **No Waste Police / Enforcement Mode (and No Anti-Extortion Safeguard):** Comm. Wahab's Night Waste Police and KAI/Project WISE teams need to log **1:00–2:00 AM dumping citations** (`₦25k`, `₦250k`, `₦1M`) with camera evidence and official digital payment references so field enforcement stops facing extortion allegations.
6. **Hardcoded Non-Pilot Scenarios:** Seeded stops/crews are not aligned with the Alimosho–Orile Agege pilot (e.g., **Gowon Estate FHA drain clearance**, **Papa Ashafa II revoked-PSP intervention**, **Ikotun Market organics**, and **Agege inner-lane tricycle handoff**).

---

## 2. Empirical Reality of Lagos Field Operations

| Field Reality | Observed Lagos Data / Constraint | Required Terminal Adaptation |
| :--- | :--- | :--- |
| **2017 EMPL Split Operational Model (~12,000–15,000 MT/day)** | PSPs handle routine neighborhood/market logistics while LAWMA directly oversees **public spaces** (highways/medians/sweepers), **specialized waste** (medical/industrial/marine), and **regulatory enforcement** under **Polluter-Pay** | Crew login must separate **PSP Neighborhood/Tricycle Shifts**, **LAWMA Public-Space Highway Sweeper Check-ins (`PUB-SPC-*`)**, **LAWMA Specialized Waste Manifests (`SPL-*`)**, and **Waste Police Enforcement (`ENF-*`)**. |
| **Intermittent Edge Connectivity & Heat/Power** | High-density inner corridors suffer 2G drops; rugged Android devices run 8–12 hr shifts under tropical sun | Preserve offline-first local outbox (`sync` screen), battery health & thermal/swap alerts (`SupervisorDashboard`), and < 2-second scan-to-save UX (`No cloud round-trip required per gate`). |
| **Unmapped Narrow Streets & Cart-Pusher Void** | Compactors cannot squeeze into inner Egbeda, Mushin, Ikotun, or Orile Agege lanes; Lagos plans **tricycle compactors** & World Bank urges cart-pusher formalization | Add a lightweight **Tricycle / Zone Micro-Collector Feeder Mode** that works with phone GPS + painted gate stencils/QR tags (zero expensive RFID required for unpaved lanes) and logs bulk handoff to a mother compactor or authorized skip. |
| **6–7 Month Compound Arrears vs. Cash Budgets** | Multi-tenant buildings split payment unevenly; blanket refusal causes midnight drain dumping | Upgrade `arrears` screen to show **Unit Payment Ratio** (e.g., `6/8 Flats Paid`), allow **Scheduled Service + Arrears Flag** for majority-paid compounds, and capture **Supervisor-Audited Override** (`reason` logged cleanly for `/security`). |
| **3-Day Landfill Delays & "Ghost" Routes** | PSP trucks lose hours/days at Olusosun/Solous III queues; unscrupulous drivers sometimes dump on road medians after claiming street completion | Require every shift to log a **Facility Check-in / Scale Ticket Scan** at `FAC-AGE` or `DS-SOL` (`tls.intake_confirmed` match) to close the route cleanly. |
| **1:00–2:00 AM Night Dumping & Extortion Claims** | Hotspot corridors refill within **2–3 hours** of clearing; statutory fines reach `₦25k–₦1M`, yet informal raids provoke `CODAF`/citizen bribery complaints | Provide dedicated **Waste Police Enforcement Mode**: GPS + timestamped photo -> generates tamper-evident LASG/Remita Bill Reference -> zero cash accepted on street. |
| **50%–55% Organic Stream & Sanitation Saturday** | Market stalls (`Ikotun`, `Igando`, `Ile-Epo`) generate dense wet food; **Last-Saturday** + daily cleanups leave bagged silt piles beside drains | Include **Market Organic Tagging** (`Organic` vs `Residual`) and **Sanitation Silt-Pile Pin Clearance** right in the `route` screen so LGA/Intervention trucks confirm clearance of citizen-pinned drains/silt bags. |

---

## 3. Audit of Existing `waste-scan-mate` Modules

| Existing Screen / Component | Strengths Observed | Gaps & Unification Actions Needed |
| :--- | :--- | :--- |
| **Deterministic Presentation Stage (`/`, `AGENTS.md`)** | Repeatable ordered scenario sequence at `/` with `Network` badge & `IPhone17Mockup` preview; zero external backend fragility during live stakeholder demos | **MUST PRESERVE** deterministic `/` behavior per `AGENTS.md`. Upgrade scenario sequence to tell the connected **Alimosho–Orile Agege story** (incl. *Gowon Estate*, *Ikotun Market*, *Orile Agege Tricycle Handoff*, *Papa Ashafa II Revoked-PSP Intervention*, and a stage link to `LAWMA v2` `/workspace`). |
| **`login` & `diagnostics` Screens** | Fast shift start, device battery/GPS/camera readiness checks | Enforce **Crew Role Selection** (`Compactor Crew`, `Tricycle Feeder`, `LGA Intervention / Revoked Recovery`, `Waste Police Enforcement`), linked cleanly to `PAR-*` Partner or `LAWMA LGA Pool`. |
| **`sync` Screen** | Visualizes offline queue backlog & network state (`Depot Wi-Fi`, `4G`, `2G / Edge`, `Offline`) | Define exact `hub-contract.ts` v2 outbox items (`scan.completed`, `scan.arrears_override`, `scan.exception`, `handoff.logged`, `enforcement.citation_logged`, `route.tip_recorded`) with idempotency keys. |
| **`route` Screen** | Property cards (`Home`, `Flats`, `Shop`, `Office`, `School`), ordered stop progress, status badges | Support **Compound Split-Pay Status** (`6/8 Paid`), **Organic Market Bins**, **Sanitation Silt-Pile Pins (`PUB-*` linked)**, and **Revoked-Ward Grace Bypass** (so intervention trucks clear *Papa Ashafa II* without flagging every paid home as `wrong-zone`). |
| **`camera` Screen (`ScanOutcome`)** | Fast visual tag outcomes: `valid`, `arrears`, `already-collected`, `wrong-zone`, `damaged-tag` | Add **Auto Geo-Fence Distance Check** (`<= 75m` from premise pin) + optional **Gate Photo Fallback** for unpaved compounds without intact RFID stickers, plus **`tricycle-handoff`** QR scan when transferring load to a mother compactor/TLS. |
| **`arrears` & `exception` Screens** | Captures supervisor override for unpaid bins and logs damaged/blocked access exceptions | Distinguish **Compound Partial Paid** vs **Full Compound Default**; enforce mandatory reason codes on overrides; feed `damaged-tag` directly to `Partner` bin/tag replacement queue. |
| **`SupervisorDashboard.tsx`** | Multi-crew telemetry (`Babatunde A.`, `Musa K.`, `Adaeze N.`), pending offline sync counts, battery swap warning, override audit | Add **Facility Tip-Off Status** (`Waiting at DS-SOL`, `Cleared at FAC-AGE`), **Override Threshold Alert** (`>15%` shift override fraud signal mirrored in `Partner /security`), and **Night Enforcement Patrol Log**. |
| **`IPhone17Mockup` Stage** | Presents Resident experience side-by-side in realistic hardware framing | Keep synchronized with **Resident PRD** changes (monthly compound split-pay, Friday SLA escrow countdown, Verified Licensed PSP badge, `Papa Ashafa II` interim protection notice, photo+GPS `/report`). |

---

## 4. Research Conclusions: What Makes `Operator` High-Impact

1. **Scan Proof Protects *Both* Sides:** An offline scan takes `< 3 seconds` yet simultaneously releases PSP `80/20` escrow in `Partner`, clears the Resident's Friday SLA shield in `Resident`, and scores the LCDA in `Workspace`'s **20/37 Cleanliness Competition**.
2. **Formalizing Tricycle Micro-Collectors Beats Prohibitive Crackdowns:** Giving local tricycles and reformed cart pushers a simplified QR/GPS `Feeder Mode` transforms an unregulated shadow workforce into measurable primary-collection feeders.
3. **End-of-Shift Facility Verification Eliminates Mid-Route Dumping:** Pairing household scan totals with `FAC-AGE` / `DS-SOL` tip-off QR tickets guarantees that waste scanned at the gate actually reaches legal infrastructure.
4. **Digital Enforcement Eliminates Extortion Disputes:** Putting Waste Police citations inside the same auditable device with timestamped photos and non-cash Remita bill references protects citizen trust as strongly as it deters 1–2 AM dumpers.
5. **Pragmatic Field Hardware, Rainy-Season Exceptions & Hazardous Rejects:** Running `waste-scan-mate` on standard Android smartphones scanning low-cost painted gate stencils / laminated QR stickers (`TAG-*`) fits Lagos's `₦1.77T` budget, while explicit **`flood-access`** weather exceptions, **hazardous/medical waste rejection** (protecting Agege TLS segregation), and **NDPA 2023 PII masking** keep crews safe and compliant.
6. **Sync Key Parity (`messages.ts` Gap):** `LAWMA-360-customer-app/src/routes/api/public/messages.ts` currently authenticates only `PARTNER_APP_KEY` and `LAWMA_APP_KEY`; pilot productionization must add `OPERATOR_APP_KEY` and rotate toward short-lived scoped tokens.
