# PRD: Resident & Estate App / Multi-Channel Access (`Resident`)

**Document Version:** 2.0 (Unified Cross-System Specification)  
**Codebase Base:** `LAWMA SmartWaste360 Customer App` + `LAWMA-360-customer-app` (`LocalVoiceAgent`, `PartnerLogo`, `ios.tsx`)  
**Presentation Framing:** Responsive mobile PWA staged inside `IPhone17Mockup` (`waste-scan-mate`) + USSD/WhatsApp fallback parity  
**Pilot Scope:** Alimosho–Orile Agege–Agege TLS Lagos West Corridor (`LCDA-ALI-*` + `LCDA-ORA-PA2`)  
**Canonical Data Contract:** `hub-contract.ts` v2 (`APPS = ["customer", "partner", "operator", "lawma"]`)  

---

## 1. Product Vision & Cross-System Boundaries

`Resident` is the **trust, payment-protection, civic reporting, and source-handling layer** of the 4-Pillar Civic Waste Operating System under Lagos's **2017 Environmental Management and Protection Law (EMPL)** and **Polluter-Pay Policy**. It guarantees residents of Lagos (whether via iPhone/Android PWA, WhatsApp, or feature-phone USSD) that fulfilling their statutory Polluter-Pay obligation through approved channels produces verifiable weekly service—or triggers immediate financial protection and state intervention.

- **Reconciles Sibling Repos:** Merges the Supabase account persistence & `hub-contract.ts` messaging of `LAWMA SmartWaste360 Customer App` with the **5-language `LocalVoiceAgent`** (`pcm`, `yo`, `ig`, `ha`, `en`), **`PartnerLogo.tsx`**, **`ios.tsx`**, and low-friction onboarding of `LAWMA-360-customer-app`.
- **Synchronized Data Rules:**
  - Never offers single-household PSP franchise shopping (follows LAWMA ward allocation).
  - Never uses per-pickup pricing for routine collection (uses **Monthly Compound / Estate Subscriptions + Optional Bulk Add-ons**).
  - Escrow releases **only** on `Operator` scan (`scan.completed` from `waste-scan-mate`).

---

## 2. Personas & Channel Inclusion

| Persona / Segment | Primary Needs | Access Tier |
| :--- | :--- | :--- |
| **Single Household / Flat Tenant** | Small predictable monthly share (`₦1,500–₦2,500`), USSD/Bank Transfer top-up, proof their street was picked up, easy Pidgin/Yorùbá voice support. | Mobile App / WhatsApp / USSD (`*...#` & bill ref) |
| **Compound / Landlord / CDA Lead** *(Egbeda, Ikotun, FESTAC/Gowon Block)* | Shared Premise Account (`CMP-*`), track which flats contributed (`6/8 Paid`), bulk/Sanitation Saturday silt pinning, zero cutoff from 1–2 defaulters. | Mobile App (`Compound Lead` toggle) |
| **Gated Estate Facility Manager** *(e.g., Gowon Estate, Estates)* | Consolidated Estate billing with `3%–8%` tiered volume discount, gate check-in photo proof, bulk organic/recycling coordination. | Mobile App / Web Portal |
| **Unregistered / Walk-Up Citizen** | Instant report of 1–2 AM blackspots, blocked drains, or extortion; verify who the real licensed PSP is on their street *before* paying anyone cash. | **Guest / Pay-Without-Sign-In Mode** (Zero login barrier) |

---

## 3. Complete Functional Module Specifications

### Module 1: Progressive Onboarding, Auth, Wrappers & 5-Language Voice (`auth.tsx`, `reset-password.tsx`, `LocalVoiceAgent`, `StickyVoiceFab`, `MockupFrame.tsx`)
- **Existing Foundation:** `Supabase Auth` (`/auth`, `/reset-password` in `LAWMA-360-customer-app`), `MockupFrame.tsx`, optional `legal/` (`EvaluationAccessWall.tsx`, `ScreenSecurityShield.tsx`), and `LocalVoiceAgent.tsx` (`DIALECTS`: `pcm` Pidgin, `yo` Yorùbá, `ig` Igbo, `ha` Hausa, `en` English).
- **Requirements:**
  1. **Zero-Friction Guest Mode:** Any user can select their LCDA/street (`LCDA-ALI-*`, `LCDA-ORA-PA2`) immediately without signing in to verify their **Assigned PSP Licence**, view the **Nearest Legal Drop-off Map**, or submit a geotagged `PUB-*` dumping/drain report.
  2. **Phone/OTP, Email (`/auth`, `/reset-password`), or Passkey Bind:** Required when binding a **Premise Tag / Compound (`CMP-*`)**, topping up Wallet Escrow, or claiming MRF Recycling Credits. Optional `EvaluationAccessWall` / `ScreenSecurityShield` wrappers apply strictly to evaluation/demo deployments—never citizen production.
  3. **Voice Assistant Everywhere (`StickyVoiceFab`):** Users can tap the voice FAB on any screen in `English`, `Pidgin`, `Yorùbá`, `Igbo`, or `Hausa` to ask *"When is my truck coming?"*, dictate a `/report` issue, or hear Wallet/SLA instructions read aloud.

### Module 2: Home Dashboard, Verified PSP Badge & Friday SLA Shield (`/`, `index.tsx`, `PartnerLogo.tsx`)
- **Existing Foundation:** Premise selector, partner card, quick hero status.
- **Additions & Requirements *(Pillar A)*:**
  1. **Verified Licensed PSP Badge (`Active` vs. `Interim Recovery`):** Displays official partner logo (`PartnerLogo.tsx`), LAWMA Permit ID (`PAR-*`), status pill (`Active Verified` in green, or amber/blue banner when ward PSP is `Revoked`/`Suspended`, e.g., *Papa Ashafa II*: **"Previous operator licence withdrawn — Interim LAWMA Intervention Truck active. No double payment; pay approved channels only"**).
  2. **Friday SLA Countdown & Saturday-Noon Auto-Protection Card:** Displays contracted weekly day (e.g., `Every Friday · 07:00–17:00`). If no `Operator` scan (`scan.completed`) arrives by **Saturday 12:00 WAT**, the card flips to **`Escrow Protected`**, automatically pauses PSP payout, emits `sla.breach_escalated` to `Workspace`, and tracks the dispatched **LGA Intervention Truck** (if delayed by a verified `Operator` `flood-access` storm block, displays **`Rainy-Season 48h Reschedule Window`** transparently).
  3. **Nearest Legal Drop-off & Public Bins Locator (`New`):** Interactive drawer/map showing verified **Temporary Transfer Points (`Agege TLS`, holding skips)**, **Public Recycling Bins**, and approved **Buyback Hubs**—so overflowing homes never pay cart pushers or dump on road medians.
  4. **LCDA Cleanliness & Daily Sanitation Strip (`New`):** Displays the user's host LCDA rank in Comm. Wahab's **20 LGAs & 37 LCDAs Cleanliness Competition**, plus quick-action **Log Daily Sweep / RSVP Last-Saturday Sanitation**.

### Module 3: Monthly Compound Split-Billing, Agent Cash Vouchers & MRF Credits (`/wallet`, `wallet.tsx`)
- **Existing Foundation:** `balance`, `reserved` escrow, `Card` / `Bank transfer` / `USSD`, itemized ledger.
- **Additions & Requirements *(Contradiction Resolution)*:**
  1. **Monthly Tariff Engine (`Aligns with LAWMA v2`):** Replaces per-pickup `₦1,450` pricing with canonical **Monthly Premise Subscriptions** (`₦1,500–₦2,500/unit/month` compound/apartment bands) plus optional **Estate Tier Discounts (`3%–8%` off for consolidated estates)**.
  2. **Compound / Estate Split-Pay & Cash-to-Voucher Parity (`Pillar A.3`):** Tenants join a shared `CMP-*` account via QR/short code and pay their individual flat quota (`Pay-Small-Small`, weekly or monthly via **USSD / Bank Transfer / Card**, or via Partner agent **`VCH-*` Cash-to-Digital Voucher** for unbanked households). Shows transparent `Paid Units (e.g., 6/8)` status and ensures paying tenants keep their SLA proof protection even if a neighbor lags.
  3. **True Escrow Mechanics (`Fixes Partner Bug`):** Monthly installment enters `Escrow Protected` (`reserved`); releases to the PSP **only** on verified `Operator` pickup scan (`scan.completed`) or gated photo receipt—**never** upon dispatch scheduling.
  4. **MRF, Biological & Energy Recovery Credits (`Pillar C.4` — 6-Stage Transparency):** Dedicated sub-balance inside Wallet where Stage 2 sorted dry recyclables (`Material Recovery MAT-*`) or sorted wet organics (`Biological Treatment FAC-ORG-ALI` / `Energy Recovery FAC-WTE-LAG` biogas/RDF) offset up to 100% of monthly Polluter-Pay dues, showing a live breakdown of how much compound waste avoided **Landfilling (`DS-SOL`)**.

### Module 4: Activity, Pickup Proof & Ad-Hoc Requests (`/activity`, `activity.tsx`)
- **Existing Foundation:** Pickup booking, status timeline, cancel.
- **Additions & Requirements:**
  1. **Verified Collection Timeline:** Every scheduled cycle shows immutable proof: `Truck / Tricycle ID`, `Timestamp`, `GPS Gate Check`, and **`Operator Scan / Gate Photo Evidence`**.
  2. **Scoped Ad-Hoc Booking:** Restricts "New Pickup Request" to **Extra Bulk / Renovation Waste** or **Sanitation Saturday Bagged Silt-Pile Clearance** (pinning bagged silt from neighborhood drain cleanups for LGA/PSP pickup), instead of misrepresenting routine weekly service as a gig request.

### Module 5: Smart & Source-Separated Bins / 3-Tier Tagging (`/bins`, `bins.tsx`)
- **Existing Foundation:** `120L` / `240L` / `360L` smart bin orders (max 5).
- **Additions & Requirements:** Display bound physical `TAG-*` status (`Painted Stencil / QR Sticker`, `Bin QR/NFC`, or `UHF RFID`), add **Source-Separation Selector** (`General Residual`, `Wet Organics / Compost Sack`, `Dry Recyclables Bag`), and show automatic free **Damaged Tag Replacement** status whenever an `Operator` scans `damaged-tag`.

### Module 6: Geo-Photo Report, Drain Jurisdiction Triage & NDPA Safety (`/report`, `report.tsx`, `report-ai.ts`)
- **Existing Foundation:** 9 `REPORT_CATEGORIES`, `report-ai.server.ts` routing (`partner`/`lawma`).
- **Additions & Requirements *(Contradiction #4 Fix)*:**
  1. **Mandatory Camera/Photo + GPS Pin (`Mirrors ReportFlow.tsx`):** Compresses up to 3 photos (`<= 960px` JPEG) in-browser + captures Lagos-bounded GPS pin (with offline queue fallback if signal drops on inner streets).
  2. **5-Way Jurisdiction Auto-Classifier (`New` — Reflects Split Operational Model):**
     - `Missed PSP Collection / Overflowing Tag` -> **`Partner` + `Workspace` SLA Monitor** (Neighborhood PSP lane)
     - `Blocked Street Drain / Sand / Sewage` inside Federal Estates (*Gowon Estate / FESTAC*) -> **`FHA` + `LAWMA Liaison`**; elsewhere -> **`LGA Works / Drainage`**
     - `Highway / BRT Median Refuse, Canal Obstruction, or 1–2 AM Blackspot` -> **`Workspace` Public Spaces (`PUB-SPC-*`) & Night Waste Police (`PUB-*` / `HOT-*`)**
     - `Clinic/Medical Sharps, Chemical, or Industrial Hazardous Waste` -> **`Workspace` Specialized Waste Directorate (`SPL-*`)**
     - `Cash Extortion / Fake Collector / Contested Raid` -> **Confidential `Workspace` Enforcement Internal Audit (`INC-*`)**
  3. **NDPA 2023 Whistleblower Anonymization:** All `HOT-*` night-dumping and `INC-*` extortion reports issue an `ANON-*` reporter token; raw citizen phone numbers and flat addresses are stripped before reaching field or enforcement terminals.
  4. **30-Min Ack Timer & Concrete Multi-Channel Flows:** Displays live SLA countdown (`ALARM_ACK_LIMIT_MIN = 30`) and mirrors unified `PUB-*` IDs across App, `LAWMA v2 /report`, **USSD (`< 120s` 5-option stateless menu)**, and **WhatsApp Cloud API (inbound photo + native Location pin)**. All synced via `/api/public/messages` (`hub-contract.ts` v2 with short-lived scoped tokens; `experience.js` `serviceAPI` demo-only).

### Module 7: Account, Governance Escalation & Cleanliness Hub (`/you`, `you.tsx`)
- **Existing Foundation:** `LinkStatus`, Quick help, My cases + replies, `requestProviderChange`, Passkey/Sign-out.
- **Additions & Requirements:**
  1. **Replace `requestProviderChange` (`Contradiction #2 Fix`):** Remove voluntary single-user PSP switching. Provide a prominent **`Escalate Repeat PSP Failure to LAWMA`** action that attaches verified SLA miss history directly to a `Workspace` **`REV-*` Compliance Review / `"Move Work"`** trigger.
  2. **Compound & WhatsApp/USSD Settings:** Manage compound member invites, opt into **WhatsApp Gate Photo Alerts** (optional low-data notification channel inspired by WasteAway), and register linked feature-phone numbers for offline USSD alerts.

---

## 4. Acceptance Criteria & Cross-System Guarantees

| Criterion | Verification Target |
| :--- | :--- |
| **Zero Billing Contradiction** | Routine pickups never prompt ₦1,500 per-pickup charges; monthly compound split-pay matches `Workspace` & `Partner` tariff bands (`₦1,500–₦2,500/unit` base + estate `3%–8%` tiers). |
| **Escrow Safety Under Failure** | Missing a Friday pickup past Saturday 12:00 WAT prevents Wallet deduction transfer, flips Home SLA badge to **`Escrow Protected`**, and creates a trackable `Workspace` recovery ticket. |
| **Revoked PSP Continuity** | When `Workspace` sets `PAR-*` to `Revoked` (e.g., *Papa Ashafa II*), `Resident` shows Interim Coverage warning + Verified Channels notice within `< 5s` (`hub-contract.ts` v2) with zero broken billing. |
| **Geo-Photo Drain Triage** | Every `/report` submission supports compressed photo + Lagos GPS, classifies `FHA` vs `LGA` vs `LAWMA` vs `PSP` deterministically, and produces a unified `PUB-*` ID visible in `Workspace`. |
