# PRD: PSP Partner Hub (`Partner`)

**Document Version:** 2.0 (Unified Cross-System Specification)  
**Codebase Base:** `LAWMA SmartWaste360_Partner` + `LAWMA-360-partner-app`  
**Pilot Scope:** Alimosho–Orile Agege–Agege TLS Lagos West Corridor (`LCDA-ALI-*` + `LCDA-ORA-PA2`)  
**Canonical Data Contract:** `hub-contract.ts` v2 (`APPS = ["customer", "partner", "operator", "lawma"]`)  

---

## 1. Product Vision & Cross-System Contract

`Partner` is the **business, fleet, enumeration, and settlement cockpit** for Lagos's **400–450 accredited PSPs** executing **routine neighborhood & commercial logistics** under the **2017 Environmental Management and Protection Law (EMPL)** and **Polluter-Pay Policy** (distinct from LAWMA's direct oversight of public spaces, specialized waste, and enforcement). It closes the middle gap of the **4-Pillar Civic Waste Operating System**:
- **Receives from `Resident`:** Monthly compound/estate subscriptions, extra bulk pickup add-ons, bin requests (`120L/240L/360L`), and complaint threads.
- **Dispatches & Verifies via `Operator` (`waste-scan-mate`):** Pushes daily compound stop manifests (`Compactor` & `Tricycle Micro-Collector` tiers); receives offline-first NFC/QR scans, arrears override audits, and tip-off photos.
- **Reports & Settles with `Workspace` (`LAWMA v2`):** Mirrors official `Active | Probation | Suspended | Revoked` franchise status, submits crew/vehicle permits (`fleet.ts`), receives TLS/Solous II intake weight receipts (`FAC-AGE` / `DS-SOL`), and settles weekly **80/20** remittances every **Friday 5 PM (`REMITTANCE_DEADLINE`)**.

---

## 2. Personas & Access Control

| Role | Primary Workflows | Access Guard |
| :--- | :--- | :--- |
| **PSP Managing Director / Owner** | Licence Risk Scorecard, 80/20 Remittance & Bank Settlements (`/finance`), LAWMA compliance responses (`/messages`), Interim Ward Takeover approvals. | Full Partner RBAC (requires authenticated partner session; retains optional watermarked `EvaluationAccessWall` / `ScreenSecurityShield` for external stakeholder demos). |
| **Operations & Route Dispatcher** | Crew assignment, Two-Tier Fleet (`Compactor` + `Tricycle Micro-Collector`), Solous II / Agege TLS slot planning (`/operations`, `/fleet`), bulk/Sanitation requests (`/requests`). | Read/Write on `/`, `/requests`, `/operations`, `/fleet`, `/customers` (no remittance disbursement). |
| **Enumeration & Customer Lead** | Digital household/compound registration, Tag/RFID provisioning, Estate multi-unit discount setup, customer dispute resolution (`/customers`, `/messages`). | Read/Write on `/customers`, `/messages`, `/requests` (bins). |
| **Fleet & Fraud Auditor** | Reviewing GPS/speeding/permit alerts (`fleet.ts` `RULES`), investigating `waste-scan-mate` arrears overrides & ghost stops (`/security`). | Read on all; Write on `/security` flags & incident annotations. |

---

## 3. Complete Functional Module Specifications

### Module 1: Executive Partner Overview & SLA Scorecard (`/`, `index.tsx`)
- **Existing Foundation:** Action banners, fleet KPIs, `earningsUncaptured`, activity log.
- **Additions & Requirements:**
  1. **Friday / Weekly Corridor SLA Gauge (`New`):** Shows scheduled compounds vs. `Operator`-verified scans for the current cycle, explicitly highlighting any street approaching the **Saturday 12:00 WAT SLA freeze deadline** (so dispatchers recover missed blocks *before* escrow freezes and LAWMA dispatches a backup LGA truck).
  2. **Licence & Capacity Risk Scorecard (`Mirrored with Workspace REV-*`):** Displays live standing (`Active` / `Probation` / `Suspended` / `Revoked`), composite score across:
     - Verified pickup completion rate (`>= 85%` target)
     - Compliant vehicles ratio (`fleet.ts` `RULES` pass rate)
     - Weighed facility tip-off match rate (`FAC-AGE` + `DS-SOL`)
     - Mean `PUB-*` escalation closure time
  3. **Live Mid-Mile Facility Strip (`New`):** Real-time card showing **Solous II (`DS-SOL`)** daily compactor slots (`X / 100`, avg wait min) and **Agege TLS (`FAC-AGE`)** weighbridge status (`Online` / `Manual Outage` / `Queue > 45m`).

### Module 2: Requests, Bulk Add-Ons & Smart Bin Fulfillment (`/requests`, `requests.tsx`)
- **Existing Foundation:** Pickup request queue (`acceptRequest`, `declineRequest`), smart bin request queue (`approveBinRequest`, `declineBinRequest`).
- **Additions & Requirements *(Contradiction Resolution)*:**
  1. **Scope Requests Properly:** Routine weekly residential pickups are **never** individual customer requests—they run via automated **Monthly Corridor Schedules** (`/operations`). `/requests` handles only:
     - **On-Demand Extra / Bulk / Renovation Pickups** (paid add-ons above monthly allowance)
     - **Sanitation Saturday & Daily Sweep Silt-Pile Pins** (routed by CDA leads or LAWMA LGA coordinators)
     - **New / Replacement Smart Bin Requests (`120L` / `240L` / `360L`, max 5)**
  2. **Remove Premature Financial Release Bug (`Critical Fix`):** `acceptRequest` transitions pickup status to `Scheduled` and assigns crew/window **without** releasing `reserved` funds or logging `"Partner credited"`. Payment capture happens **exclusively** on verified `Operator` completion (`scan.completed` or gated photo receipt).

### Module 3: Two-Tier Dispatch & Field Telemetry Verification (`/operations`, `operations.tsx`)
- **Existing Foundation:** Crew list, RouteStops, manual `completeStop`, `assignCrew`, `setPickupStatus`.
- **Additions & Requirements:**
  1. **Two-Tier Fleet Orchestration (`Pillar B`):**
     - **Tier 1 (`Tricycle Micro-Collector` / Zone Micro-Collector `TRI-*`):** Dispatched to unpaved/narrow inner lanes (e.g., inside *Egbeda, Ikotun, Ayobo, Orile Agege*) with a **Skip / TLS Handoff Destination** (linking loads transferred into a Mother Compactor or `FAC-AGE`).
     - **Tier 2 (`Compactor` `FLT-*`):** Dispatched to arterial/estate/market corridors and mid-mile haulage to `FAC-AGE` or `DS-SOL`.
  2. **Scan-Locked Stop Completion (`Contradiction Fix`):** RouteStops display an **`Operator Scan Badge`** (`RFID Scan + GPS` vs. `Manual Dispatch Override`). Dispatchers cannot silently mark stops `Completed` without either a linked `waste-scan-mate` (`OPR-*`) event or an explicit audited exception reason (surfaced to `/security` and `Workspace`).
  3. **Zone Micro-Collector Onboarding (`Cart-Pusher Formalization`):** Supports enrolling vetted local cart pushers as registered Tier-1 feeder operators under the PSP's ward permit, issuing digital Crew IDs for `waste-scan-mate` Feeder Mode.

### Module 4: Fleet Compliance, Mid-Mile Routing & Tip Receipts (`/fleet`, `fleet.tsx`, `FleetMap.tsx`, `fleet.ts`)
- **Existing Foundation:** `FleetMap.tsx` + `fleet.ts` `RULES` (`speedLimitKmh: 50`, `maxLoadPct: 100`, `maxPingGapMin: 10`, `inspectionDays: 90`, `hours: [6, 22]`, `wasteCovered`, `inZone`, `permitExpires`).
- **Additions & Requirements:**
  1. **Extend `fleet.ts` Asset Types:** Parameterize `RULES` cleanly across `Compactor` and `Tricycle Micro-Collector` (e.g., tricycles exempt from highway weighbridge tare but subject to `inZone` geofence and designated transfer-point drop validation).
  2. **Solous II, Agege TLS & 4-Branch Destination Routing:** Suggest optimal tip-off destination per active truck based on zone, waste stream, and live `Workspace` telemetry: *(a)* **Transfer (`FAC-AGE`)**, *(b)* **Landfill (`DS-SOL` / `DS-OLU` fallback if `DS-SOL >= 90/100` or `> 45m`)**, *(c)* **Material Recovery (`MAT-*`)**, *(d)* **Biological Treatment (`FAC-ORG-ALI`)**, *(e)* **Energy Recovery (`FAC-WTE-LAG` biogas/RDF)**, or **secondary process-reject (`MAT-RES-*`)** haulage from treatment plants back down to landfill.
  3. **Tip-Off Weight Receipt Inbox:** Displays every `TRP-*` and `MAT-RES-*` scale ticket emitted by `Workspace` TLS (`FAC-AGE`), Treatment (`FAC-ORG-ALI` / `FAC-WTE-LAG`), or Disposal (`DS-SOL`), linking truck mass to that shift's scanned compound count to detect unauthorized dumping before reaching the facility.

### Module 5: Digital Enumeration, 3-Tier Tag Provisioning & Compound Split-Billing (`/customers`, `customers.tsx`)
- **Existing Foundation:** Customer directory, `addCustomer` modal, customer detail sheet (`bins`, `pickups`, `entries`, `issues`, `notices`, `resolveIssue`).
- **Additions & Requirements:**
  1. **Lagos Premise Taxonomy (`Canonical with Operator`):** `Home` | `Compound / Multi-Flat` | `Gated Estate` | `Shop / Plaza` | `Market Stall` | `Office` | `School`.
  2. **3-Tier Low-Cost Tag Provisioning (`TAG-*` -> `CMP-*`):** Partner enumerators bind physical identifiers during onboarding before billing activates: *(a)* `Painted Gate Stencil / Weatherproof QR Sticker` (for low-income/unpaved inner lanes without smart bins), *(b)* `Bin QR / NFC Tag` (`120L–360L`), and *(c)* optional `UHF RFID` (for commercial/estate skips). `damaged-tag` flags from `Operator` auto-open a replacement task here.
  3. **Compound / Multi-Flat Split-Billing Support:** Allows a PSP enumerator or CDA/Landlord to register `N` sub-units under one physical bin/premise tag (`CMP-*`), showing *Paid vs. Unpaid unit ratio* (e.g., `6 / 8 flats paid`), eliminating street-wide cutoffs over 1–2 defaulters. Supports WasteAway-inspired **3%–8% tiered estate group discount** for gated estates (e.g., *Gowon Estate* blocks) paying together via consolidated schedule.
  4. **Organic Segregation Flag (`New`):** Marks commercial markets (`Ikotun`, `Igando`, `Ile-Epo`) and large eateries with `sortedOrganicsEnrolled = true` so drivers know to route wet-food bins separately to `FAC-ORG-ALI`.
  5. **Alimosho Pilot Seed Refactor:** Replace Lekki/Ajah/Yaba/Ikeja sample areas with canonical Alimosho 6 LCDAs + `LCDA-ORA-PA2` (*Papa Ashafa II* interim transfer scenario).

### Module 6: Escrow-Verified Finance, Cash-to-Voucher & Bankable 80/20 Remittances (`/finance`, `finance.tsx`, `receipt.ts`, `store.tsx`)
- **Existing Foundation:** `PARTNER_SHARE = 0.8` (`80% Partner / 20% LAWMA`), `remitToLawma()`, PDF receipt generator (`receipt.ts`).
- **Additions & Requirements:**
  1. **Three-Stage Escrow Ledger (`Fixes store.tsx Bug`):**
     - **Held in Resident Escrow:** Monthly subscriptions & extra pickups paid by households for cycles not yet scanned by `Operator`.
     - **Scan-Verified Clearable Earnings:** Funds automatically unlocked *only* upon `scan.completed` (or gated estate confirmation) and tip-off validation.
     - **SLA Auto-Freeze & Rainy-Season Flood Grace:** Funds freeze when a Friday/weekly pickup misses the **Saturday 12:00 WAT** cutoff; however, routes paused under a verified `Operator` `flood-access` photo exception enter a `48h Weather Grace` reschedule rather than auto-penalizing the PSP.
  2. **Agent-Assisted Cash-to-Digital Voucher Deposit (`New`):** When an unbanked resident pays cash to an accredited enumerator, the agent deducts from a pre-funded Partner float wallet and immediately issues a numbered SMS/USSD voucher (`VCH-*`)—preventing unrecorded off-book cash leakage.
  3. **Weekly Friday 5 PM Remittance & Bankable Working-Capital Statements (`REMITTANCE_DEADLINE`):** Generates itemized Remita/bank settlement schedule (`80%` PSP Net / `20%` LAWMA Share) **plus** downloadable, LAWMA-countersigned SLA & Recurring Revenue Statements (`receipt.ts`) usable for SME diesel credit and fleet micro-leasing.

### Module 7: Messages, Security Audit & Settings (`/messages`, `/security`, `/settings`)
- **Messages (`/messages`):** Real-time inbox unified onto `/api/public/messages` (`hub-contract.ts` v2, short-lived scoped tokens replacing static `x-app-key`) bridging `(a)` Resident escalation/issue chats, `(b)` LAWMA compliance notices & `"Move work"` / `Revocation` alerts (plus `experience.js` `serviceAPI` preserved strictly for demo walkthroughs), and `(c)` Crew supervisor flags (`waste-scan-mate`).
- **Security (`/security`, `security-ai.server.ts`):** Upgrades anomaly detection to flag *(1)* >15% manual arrears overrides by a crew in one shift (`waste-scan-mate`), *(2)* trucks marked `Completed` without TLS/Solous II gate entry within 4 hours, *(3)* GPS ping gaps (`> 10 min`) near known 1–2 AM dumping corridors, and *(4)* cash collection attempts outside official USSD/Wallet/Remita invoices or `VCH-*` agent vouchers. Enforces **NDPA 2023 PII minimization** so crew handhelds never see raw resident phone numbers.
- **Settings (`/settings`):** Displays immutable LAWMA Franchise Metadata (`PAR-*`, Licence Status Badge, Assigned Ward Codes, Permitted Vehicle Slots), plus editable depot coordinates, supervisor phone alerts, and NDA/Evaluation Shield toggle (`ScreenSecurityShield.tsx` / `EvaluationAccessWall.tsx`).

---

## 4. Acceptance Criteria & Cross-System Guarantees

| Criterion | Verification Target |
| :--- | :--- |
| **Escrow Integrity** | `acceptRequest()` or route scheduling **never** decrements customer `reserved` or credits partner earnings; *only* verified `Operator` scan (`OPR-*`) or audited fallback completion captures earnings. |
| **Saturday-Noon Freeze** | Unscanned Friday stops trigger automated `Escrow Hold` alert at Saturday 12:00 WAT and emit `sla.breach_alert` to `Workspace`. |
| **Licence Sync** | Setting `status = "Revoked"` in `Workspace` disables crew dispatch & remittance withdrawal in `Partner` within `< 5s` (`hub-contract.ts` v2) and flags customers with interim coverage notice. |
| **Receipt Reconciliation** | `remitToLawma()` totals match `Workspace` `remittances` (`80/20` exact to ₦1) and attach matching `TRP-*` disposal scale ticket IDs. |
