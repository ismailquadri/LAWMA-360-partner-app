# PRD: Operator & Field Crew Terminal (`Operator`)

**Document Version:** 2.0 (Unified Cross-System Specification)  
**Codebase Base:** `waste-scan-mate` (`/Users/quadri/Downloads/waste-scan-mate`)  
**Pilot Scope:** Alimosho–Orile Agege–Agege TLS Lagos West Corridor (`LCDA-ALI-*` + `LCDA-ORA-PA2`)  
**Canonical Data Contract:** `hub-contract.ts` v2 (`APPS = ["customer", "partner", "operator", "lawma"]`)  

---

## 1. Product Vision & Cross-System Boundaries

`Operator` (`waste-scan-mate`) is the **offline-first edge data capture terminal** for primary collection, inner-lane feeder handoffs, Sanitation Saturday clearances, and audited field enforcement.
- **Strictly Preserves Simulation Mandate (`AGENTS.md`):** The presentation prototype at `/` remains a deterministic, self-contained client-side simulation driven by an **ordered Lagos scenario sequence** (with no external runtime dependency required to run demos), while defining the production sync schema for live pilot deployment.
- **Cross-System Events Emitted (`hub-contract.ts` v2):**
  - To `Partner` & `Resident`: `scan.completed` (unlocks Friday SLA & escrow clearance), `scan.exception`, `scan.arrears_override`.
  - To `Partner` & `Workspace`: `route.started`, `route.tip_recorded` (truck check-in/ticket link at `FAC-AGE` / `DS-SOL` / `FAC-ORG-ALI`), `handoff.logged` (`Tricycle` -> `Compactor` / `TLS`).
  - To `Workspace` Enforcement (`ENF-*`): `enforcement.citation_logged` (Waste Police / KAI audited digital citation).

---

## 2. Field Operational Modes (`Role Selector at Login`)

Upon shift sign-in (`login` screen), the operator selects (or is provisioned to) one of four unified modes mapped directly to `Workspace` & `Partner` dispatch (`ASN-*`):

| Operational Mode | Primary Asset Class | Assigned Pilot Corridors | Core Outcomes |
| :--- | :--- | :--- | :--- |
| **1. Trunk Compactor Crew** *(Default)* | `Compactor` (`FLT-*`) | Estates (*Gowon Estate FHA*), paved residential streets (*Egbeda, Idimu, Ikotun*), bulk requests | Compound/bin scanning, Friday SLA verification, `FAC-AGE` / `DS-SOL` tip-off match. |
| **2. Tricycle / Zone Micro-Collector Feeder** | `Tricycle Micro-Collector` (`TRI-*`) | Narrow unpaved inner lanes (*Ikotun inner streets, Ayobo, Orile Agege*) | Rapid QR/GPS inner-street clearance, handoff scan to Mother Compactor or `FAC-AGE` skip. |
| **3. LGA Intervention, Public-Space & Sanitation Mode** | `LGA Pool Truck` (`Conference 57`) / Highway Sweeper Supervisor | Revoked PSP wards (`Papa Ashafa II`), Saturday-noon backups, **LAWMA Public Spaces** (expressways, medians, pedestrian bridges, highway sweeper gang checkpoints `PUB-SPC-*`), & silt pins | Clears emergency/revoked routes (`PUB-*`) **without local billing blocks**, verifies daily public-space highway sweeping & silt-bag clearances. |
| **4. Waste Police & Specialized Waste Mode** | Foot / Patrol Vehicle / Certified `SPL-*` Van | Night hotspots (00:30–03:30 *Alimosho, Egbeda, Idimu, Agege*), drain/canal & **2017 EMPL Polluter-Pay** enforcement + **Medical/Industrial Special-Waste chain-of-custody (`SPL-*`)** | Logs photo + GPS evidence & non-cash LASG/Remita citation ref (`₦25k`, `₦250k`, `₦1M`), or seals dedicated special-waste manifests (`FAC-AGE` medical unit). |

---

## 3. Complete Functional Module Specifications

### Module 1: Shift Auth, Pre-Shift Diagnostics & Battery/GPS Guard (`login`, `diagnostics`)
- **Existing Foundation:** Shift login, hardware/sensor readiness diagnostics.
- **Requirements:**
  1. Verify GPS fix (`<= 30m` accuracy), camera permission, minimum `>= 30%` battery (triggering Supervisor spare-battery alert cleanly at `< 20%`), and active Route Assignment (`ASN-*`) or Revoked-Ward Intervention Order.
  2. Display **Assigned Tip-Off Destination** at shift start (e.g., `FAC-AGE` Agege TLS for North/Orile Agege routes, `DS-SOL` Solous II for West routes, or `FAC-ORG-ALI` for Market Organics).

### Module 2: Offline-First Sync Engine & Outbox (`sync`)
- **Existing Foundation:** `Network` indicator (`Depot Wi-Fi | 4G | 2G / Edge | Offline`), pending sync queue.
- **Requirements:**
  1. Zero blocking network requests during gate scans; all events write atomically to local indexed queue (`idempotencyKey`, `capturedAt`, `gpsLat`, `gpsLng`, `networkState`).
  2. Opportunistically batch-sync via compressed payloads over `2G / Edge` and full media photos over `4G / Depot Wi-Fi`.
  3. Preserve simulated deterministic toggles on `/` for offline stakeholder demonstrations.

### Module 3: Ordered Route Manifest & Multi-Mode Stops (`route`)
- **Existing Foundation:** Ordered stops across `PropertyType` (`Home | Flats | Shop | Office | School`).
- **Additions & Requirements:**
  1. **Extend `PropertyType` (`Canonical`):** Add `Estate Block`, `Market Stall`, `Transfer Skip / Holding Point`, and `Silt / Blackspot Pin (PUB-*)`.
  2. **Alimosho–Orile Agege Ordered Scenario Sequence (`Preserves AGENTS.md`):** Update `/` demo scenarios so walkthroughs step through real Lagos conditions seamlessly:
     - *Stop 1 (`Mosan-Okunola / Gowon Estate FHA`):* **Estate Block** — Verified Friday SLA scan + FHA drain clearance confirmation.
     - *Stop 2 (`Alimosho Core / Egbeda–Idimu`):* **Multi-Flat Compound (`Flats`)** — `6/8 Flats Paid` partial arrears check -> Supervisor Audited Override vs. Partial Debt Flag.
     - *Stop 3 (`Ikotun Market MKT-ALI-01`):* **Market Stall (`Organics`)** — Source-separated wet organic load scanned & routed to `FAC-ORG-ALI`.
     - *Stop 4 (`Orile Agege — Papa Ashafa II LCDA-ORA-PA2`):* **Revoked-PSP Intervention Stop** — Replaces terminated *Guestimate Environmental*; clears street cleanly under **Intervention Bypass** (no wrong-zone/billing penalty) while warning resident against unapproved cash collectors.
     - *Stop 5 (`Agege TLS / Inner-Lane Handoff`):* **Tricycle Micro-Collector Handoff** — `TRI-*` load scanned into Mother Compactor / `FAC-AGE` bay, followed by `FAC-AGE` / `DS-SOL` tip-off ticket scan.
  3. **Quick-Jump Presentation Header (`/`):** Include a clean presentation selector allowing switching between the Crew Handheld, `IPhone17Mockup` Resident preview, `SupervisorDashboard`, and direct reference link to `LAWMA v2` (`/workspace`).

### Module 4: Zero-Touch Camera Tag, Gate Photo & Tricycle Handoff (`camera`)
- **Existing Foundation:** `ScanOutcome = "valid" | "arrears" | "already-collected" | "wrong-zone" | "damaged-tag"`.
- **Additions & Requirements:**
  1. **Add Outcome `"tricycle-handoff"` & `"silt-cleared"`:** Supports Zone Micro-Collectors transferring collected bags from unpaved lanes into a tagged compactor/skip, and LGA crews clearing Sanitation Saturday/drain silt pins (`PUB-*`).
  2. **Geo-Proximity Check (`<= 75m`):** Flags suspected off-site tag cloning if scan GPS differs from registered compound coordinates by `> 75m` (logs distance delta for `Partner /security` without blocking legitimate gate scans).
  3. **No-Tag / Gate-Photo Fallback:** Matches WasteAway's gate-photo proof pattern for newly enumerated compounds or washed-off stencils (`damaged-tag` automatically emits a bin/tag replacement ticket to `Partner`).

### Module 5: Compound Arrears, Hazardous/Flood Exceptions & Hardware Guard (`arrears`, `exception`)
- **Existing Foundation:** Arrears block/override screen, exception logger.
- **Additions & Requirements:**
  1. **Partial-Compound Intelligence:** Differentiate **`0% Paid` (Full Default)** from **`>= 50% Flats Paid` (Partial Compound Arrears)**—defaulting to *"Collect & Notify Landlord/CDA Lead"* on partial compounds so paying tenants are never punished by 1–2 defaulters.
  2. **Audited Override Budget:** Any manual arrears override logs `supervisorPin` / `crewNote` / `photoUrl` and increments a shift override counter; exceeding `15%` overrides in one shift triggers an alert in `SupervisorDashboard` and `Partner /security`.
  3. **Revoked-Ward Protection Rule:** In `Intervention Mode` (e.g., *Papa Ashafa II*), arrears blocks are automatically suppressed on recently transferred households to protect citizen goodwill during LAWMA reorganisation.
  4. **Medical / Hazardous Waste Reject (`hazard-reject`) & Rainy-Season Flood Exception (`flood-access`):** Crew logs mandatory photo evidence to reject clinic/infectious sharps or toxic e-waste mixed into domestic/market bins (protecting `FAC-AGE` medical segregation and `FAC-ORG-ALI` compost batches), and logs `flood-access` photos on submerged roads to trigger `48h Weather Grace` instead of false Saturday-noon SLA penalties.
  5. **Low-Cost Field Hardware & NDPA PII Masking:** Terminal runs on standard ruggedized or BYOD Android phones scanning `TAG-*` painted stencils, laminated QR stickers, or bin NFC/RFID tags; displays `CMP-*` ID, Street Block, and `Paid Flats` ratio *without* exposing resident phone numbers or individual tenant names.

### Module 6: Waste Police Enforcement & Anti-Extortion Module (`enforcement` — New Mode/Screen)
- **Requirements:**
  1. Officers patrolling 1:00–2:00 AM hotspot corridors (*Egbeda, Idimu, Ikotun, Agege border*) capture geotagged photo/short video evidence + offender category (`Unregistered Premise >= ₦25k`, `Drain/Canal/Median Dumping <= ₦250k`, `Commercial/Corporate <= ₦1M`).
  2. Terminal generates a read-only **Official LASG/Remita Bill Reference & Citation ID (`ENF-*`)** synced to `Workspace` (`enforcement`).
  3. **Zero Cash Handling Notice:** On-screen confirmation explicitly warns *"Do NOT collect cash. Resident appeals handled via Workspace Enforcement Desk."*

### Module 7: End-of-Shift Facility Tip-Off & Reject-Loop Reconciliation (`tipoff` — New Flow)
- **Requirements:**
  1. At route end, crew scans the QR scale ticket issued by `FAC-AGE` (Agege TLS), `MAT-*` (Material Recovery), `FAC-ORG-ALI` (Biological Treatment), `FAC-WTE-LAG` (Energy Recovery), or `DS-SOL` (Solous II Landfill) — or selects offline facility drop when weighbridge is in outage mode — linking `TRP-*` intake ID directly to the completed stops manifest.
  2. Supports secondary **`MAT-RES-*` Process-Reject Loads** leaving Material/Biological/Energy recovery centers down to `DS-SOL` / `DS-EPE` so treatment rejects close cleanly inside landfill reconciliation.
  3. Prevents routes from closing cleanly (`Shift Incomplete` state) until collected waste is accounted for at a legal transfer/recovery/treatment/disposal site (or automatically rerouted by `Workspace` during a `Facility Fire / Outage` bypass).

### Module 8: Supervisor Telemetry Dashboard (`SupervisorDashboard.tsx`) & `IPhone17Mockup` Stage
- **Existing Foundation:** Crew cards (`Babatunde A.`, `Musa K.`, `Adaeze N.`), pending sync counters, battery swap alert, arrears override log, `IPhone17Mockup`.
- **Additions & Requirements:**
  1. Add **Two-Tier Fleet Filter** (`Compactor Crews` vs `Tricycle Micro-Collectors` vs `Night Enforcement`) plus live **Facility Turnaround Status** (`En Route to DS-SOL`, `In Queue 32m`, `Cleared FAC-AGE`).
  2. Surface **Override Spike Warnings (`>15%`)** alongside battery alerts for proactive field supervision.
  3. Keep `IPhone17Mockup` stage fully consistent with `PRD-Resident.md` (Monthly Compound Split-Pay, Verified PSP Badge, Friday SLA Escrow Protection, Photo+GPS Reporting).

---

## 4. Acceptance Criteria & Cross-System Guarantees

| Criterion | Verification Target |
| :--- | :--- |
| **Preserved Simulation (`AGENTS.md`)** | `/` loads offline with zero external API failures and executes the ordered Alimosho–Orile Agege–Gowon Estate–Ikotun–Agege TLS scenario sequence deterministically. |
| **Offline Resilience** | Switching `Network` to `Offline` queues `scan.completed`, `handoff.logged`, and `enforcement.citation_logged` locally without losing fields; switching to `4G` drains queue idempotently. |
| **Zero-Contradiction Escalation** | `scan.completed` triggers Escrow Release (`Resident` & `Partner`); missing Friday scans by Saturday 12:00 WAT trigger LGA Intervention assignment usable directly in `Operator` Intervention Mode. |
| **Anti-Extortion Compliance** | Enforcement Mode cannot generate a receipt without photo + GPS + `ENF-*` bill reference, and explicitly prohibits cash entry fields. |
