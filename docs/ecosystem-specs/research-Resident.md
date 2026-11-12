# Research: Resident & Estate App / Multi-Channel Access (`Resident`)

**System Scope:** System 4 of 4 — Resident, Compound/CDA & Estate Experience (`iPhone 17` / Android / Web PWA) + USSD & WhatsApp Parity  
**Existing Codebases Audited:** `LAWMA SmartWaste360 Customer App` (`/Users/quadri/Downloads/LAWMA SmartWaste360 Customer App`) & `LAWMA-360-customer-app` (`/Users/quadri/Downloads/LAWMA-360-customer-app`)  
**Pilot Corridor:** Alimosho–Orile Agege–Agege TLS Lagos West Corridor  

---

## 1. Executive Summary & System Diagnosis

For residents of Lagos—from planned blocks in **Gowon Estate** and **FESTAC** to multi-tenant compounds in **Egbeda, Idimu, Ikotun, Ipaja**, and **Orile Agege**—waste management fails at the front gate in three painfully repeatable ways:
1. Households pay upfront yet PSPs miss collections for weeks or up to **5 months**, leaving families stuck between rising bills, ₦25,000+ fines for non-registration, and **1:00–2:00 AM median dumping** or illegal cart pushers.
2. When drains flood or roads flood during **2.2m–2.7m annual rains**, residents are bounced between **FHA/FHE**, **LGA Works**, and **LAWMA**, with no photo/GPS evidence trail or binding SLA.
3. When LAWMA revokes an underperforming operator's licence (e.g., **Guestimate Environmental in Papa Ashafa II**), residents fear service loss, extortion by unauthorized collectors, or double payment.

Auditing the two sibling codebases (`LAWMA SmartWaste360 Customer App` + `LAWMA-360-customer-app`) reveals genuine strengths—clean mobile tabs (`/`, `/bins`, `/activity`, `/wallet`, `/report`, `/you`), **Card / Bank Transfer / USSD** wallet funding, AI category routing (`report-ai.ts`), **`PartnerLogo.tsx`**, iOS HIG polish (`ios.tsx`), and an impressive 5-language **`LocalVoiceAgent` (`pcm`, `yo`, `ig`, `ha`, `en`)**—**yet exposes seven critical contradictions and UX failures** that prevent it from solving the resident problem or matching `LAWMA v2` (`Workspace`):

1. **Per-Pickup Gig Pricing Contradicts `LAWMA v2` & Breaks Alimosho Affordability:** `customer-model.ts` prices waste as individual pickup bookings (`₦1,450–₦1,500` each -> ~₦6,000/month/flat), directly contradicting `LAWMA v2`'s roadmap forbidding per-pickup tariffs and pricing out multi-tenant Alimosho compounds (`₦1,500–₦2,500/unit/month` reality). Even Abuja's private `WasteAway` (`wasteaway.ng`) offers a `₦2,192/mo` starter tier and `3%–8%` estate discounts.
2. **No Compound / Estate Split-Billing:** A 6-to-12 flat compound or CDA block cannot share one premise bin where each flat contributes small amounts via Bank Transfer or USSD—forcing either one tenant/landlord to shoulder the whole bill or getting the entire gate blackballed over 1–2 defaulters.
3. **Premature Payment Release / Zero SLA Auto-Freeze:** Combined with the `Partner` `store.tsx` bug where `acceptRequest` marks funds paid before pickup occurs, residents lack **Friday SLA Countdown + Saturday 12:00 WAT Auto-Freeze Protection** when a PSP no-shows.
4. **Voluntary `requestProviderChange` Contradicts Ward Franchises:** `/you` lets single households request switching PSPs on demand—violating Lagos's **400–450 ward-franchised PSP allocation model**—while showing **no Verified Licensed PSP Badge** and **no Revocation Continuity Banner** for revoked zones like *Papa Ashafa II*.
5. **Text-Only `/report` Lacks Photo + GPS & Drain Triage:** Unlike `LAWMA v2`'s `ReportFlow.tsx` (which shrinks camera photos to 960px and pins Lagos GPS coordinates), the Customer App's `/report` is text-only and does not distinguish **FHA vs. LGA Works vs. LAWMA Canal/Dumping vs. PSP Missed Pickup**.
6. **Codebase Fragmentation Across Sibling Repos:** `LAWMA-360-customer-app` added `LocalVoiceAgent.tsx`, `StickyVoiceFab.tsx`, `PartnerLogo.tsx`, `ios.tsx`, and zero-friction no-login entry, whereas `LAWMA SmartWaste360 Customer App` has Supabase `auth` and `hub-contract.ts` server actions. Neither is unified into one spec yet.
7. **Zero Legal Drop-off Map, Sanitation Saturday Mode, or Organic/MRF Wallet Credits:** Residents facing an emergency overflow or Last-Saturday cleanup cannot locate legal temporary transfer points, log bagged silt piles for pickup, or earn Waste Wallet credits for sorted plastics/organics.

---

## 2. Empirical Reality of Lagos Residents & Feature Benchmarks

| Resident Reality | Empirical Observation / Data | Product Requirement Triggered |
| :--- | :--- | :--- |
| **2017 EMPL, Polluter-Pay & Source Handling (Stage 2)** | Under Lagos's **2017 Environmental Management and Protection Law** & **Polluter-Pay Policy** (~12,000–15,000 MT/day), households handle/sort at source before PSP neighborhood pickup, while LAWMA oversees **public spaces** (highways/medians), **specialized waste** (medical/hazardous), and enforcement | Resident UI must connect Polluter-Pay monthly compliance directly to **Stage 2 Source Sorting incentives** (showing waste flowing to *Material Recovery, Biological Compost/BSF, Energy Recovery, or minimized Landfill*) and route public-space/medical reports directly to LAWMA rather than blaming the ward PSP. |
| **Visionscape / PUMAU Trauma** | Decoupling central **PUL/LUC** billing from street pickup triggered mass boycotts; citizens resist flat utility bills without proof of service | Every bill & Wallet deduction must be visibly bound to an **`Operator` Bin Scan + Gate Proof**, protected by automatic **Saturday-Noon Escrow Freeze** and backup dispatch. |
| **Pay-Per-Bag & Cash-Daily Affordability** | Multi-tenant inner-street earners rely on daily cash budgets (`Cart-Pusher Void`); smartphone-only apps exclude elders & low-data households | Support **Compound Split-Billing**, **Pay-Small-Small Wallet / USSD Top-ups**, and full **USSD + WhatsApp Parity** (`hubChannelsPanel` alignment) alongside the iOS/Android app. |
| **PSP Revocation Fear & Approved Channels** | **6 PSP licences withdrawn** (*Orile Agege Papa Ashafa II, Sabo Oniba, Ibereko, Oluwa 1, Oke-Ira, Abosan*); LAWMA warns *"Approved channels only — uninterrupted interim service"* | Home screen displays a prominent **Verified Licensed PSP Badge** (or **"Interim LAWMA Coverage Active — No Double Billing"** banner when ward PSP is revoked). |
| **FHA vs. State Drain Frustration** | Gowon Estate & FESTAC residents suffer sand-blocked drains & unclear federal (`FHA`) vs. LGA/State accountability | `/report` requires photo + GPS pin and **auto-routes** drain tickets (`FHA Liaison`, `LGA Works`, `LAWMA`) so citizens get a unified `PUB-*` tracker instead of silence. |
| **Daily vs. Monthly Sanitation** | Comm. Wahab & residents emphasize **daily cleanliness** alongside **Last-Saturday Sanitation**, trash cans/recycling bins, and **20 LGA / 37 LCDA competition** | Add a **Sanitation & Cleanliness Tab/Drawer**: Daily sweep check-ins, Last-Saturday RSVP, **Pin Bagged Silt Pile** for state pickup trucks, and live LCDA Competition standing. |
| **Multilingual & Low-Literacy Reality** | Lagos residents communicate fluently in Pidgin, Yorùbá, Igbo, Hausa, and English | Elevate `LocalVoiceAgent` (`DIALECTS`: `pcm`, `yo`, `ig`, `ha`, `en`) from a side experiment to first-class voice navigation, report dictation, and status readback. |
| **Competitive UX Benchmarks** | `WasteAway` (`wasteaway.ng`) proves gate photo proof + `3%–8%` estate discounts; `LAWMA Bill App` proves *"Pay Without Sign In"* conversion; `Pakam`/`Wecyclers` prove rewards wallets | Adopt gate photo proof + estate tiered discounts + instant verification without heavy login walls, while surpassing all competitors on **SLA protection + organic/MRF credits + regulatory integration**. |

---

## 3. Audit of Existing `Customer App` & Sibling Modules

| Route / File | Observed Capabilities | Contradictions / Gaps to Close |
| :--- | :--- | :--- |
| **Onboarding & Auth (`store.tsx` vs. `LAWMA-360-customer-app`)** | `Customer App` gates behind Supabase email auth; `LAWMA-360-customer-app` strips login for immediate entry; `VoiceAgent` supports 5 Nigerian languages | Reconcile into **Progressive Auth**: Instant Guest access (`LAWMA Bill App` style) for Ward PSP check, Nearest Drop-off Map, USSD code generation & `PUB-*` reporting; Phone/OTP or Passkey required only to bind a Compound Wallet & claim MRF credits. |
| **Home (`/`, `index.tsx`, `PartnerLogo.tsx`)** | Premise selector, Partner switcher, hero card | Replace generic booking hero with **Weekly Collection Countdown (e.g., *Friday Service*)**, **Verified Licensed PSP Badge** (`Active` vs. `Revoked — Interim Service`), **Saturday-Noon Auto-Protection Status**, and **LCDA Cleanliness Rank Pill**. |
| **Bins (`/bins`, `bins.tsx`)** | Request `120L / 240L / 360L` smart bins (max 5), tracks status | Add **Source-Separated Bin / Sack Option** (Wet Organic Compost Sack vs. Dry Recyclables vs. Residual Bin) and surface `damaged-tag` auto-replacements flagged by `Operator`. |
| **Activity (`/activity`, `activity.tsx`)** | One-off pickup booking, status timeline, cancellation | Split cleanly into **(a) Scheduled Corridor History** (showing verified `Operator` gate scans + gate photo/stamp + backup truck triggers) and **(b) Extra / Bulk Pickup & Silt-Pile Requests**. |
| **Wallet (`/wallet`, `wallet.tsx`, `customer-model.ts`)** | `balance`, `reserved`, `Card` / `Bank transfer` / `USSD`, ledger entries | Switch core ledger from per-pickup `₦1,450` to **Monthly Compound / Household Subscription (`₦1,500–₦2,500/unit` equiv. + `3%–8%` Gated Estate discount)** + **Compound Split-Pay Pool** + **MRF Organic/Recycling Credit Balance**. Fix escrow display so funds show `Protected Until Scanned`. |
| **Report (`/report`, `report.tsx`, `report-ai.ts`)** | 9 `REPORT_CATEGORIES`, partner/LAWMA AI triage (`report-ai.server.ts`), case tracker | Merge `LAWMA v2`'s **`ReportFlow.tsx`** photo compression (max `960px`) + GPS pin + `FHA/LGA/LAWMA/PSP` auto-jurisdiction triage, plus voice dictation via `LocalVoiceAgent` and **Zero-Extortion Field Audit Option**. |
| **You (`/you`, `you.tsx`)** | `LinkStatus`, Quick help, My cases + partner/LAWMA replies, `requestProviderChange`, Passkey/Sign out | **Remove voluntary `requestProviderChange` contradiction.** Replace with **Service Quality Escalation (`-> LAWMA Compliance / Move Work trigger`)**, **Compound / CDA Member Roster**, and **Nearest Legal Drop-off / Sanitation RSVP**. |
| **Contracts & Auth Routes (`hub-contract.ts`, `api/public/messages.ts`, `auth.tsx`, `reset-password.tsx`)** | Shared message bus with `APPS = ["customer", "partner", "lawma"]` (`PARTNER_APP_KEY`, `LAWMA_APP_KEY`), email auth/password reset routes | Extend to `hub-contract.ts` v2 (`["customer", "partner", "operator", "lawma"]`, add `OPERATOR_APP_KEY`, replace static `x-app-key` with short-lived scoped tokens); reconcile `experience.js` `serviceAPI` as demo bridge only. |
| **Wrapper & Guard Components (`MockupFrame.tsx`, `legal/EvaluationAccessWall.tsx`, `legal/ScreenSecurityShield.tsx`)** | Presentation device frame + optional NDA/watermark wall inside `LAWMA-360-customer-app` | Preserve `MockupFrame.tsx` cleanly for stakeholder iPhone/mobile walkthroughs alongside `waste-scan-mate`'s `IPhone17Mockup`; keep NDA shields configurable off for citizen production builds. |

**Additional Safeguards & Channel Realities Added:**
- **Concrete USSD / WhatsApp Flows:** Stateless `< 120s` USSD tree for feature phones (zero photo needed) + WhatsApp Cloud API inbound compressed image/location pin handler synced into `PUB-*`.
- **NDPA 2023 Reporter Anonymity:** Whistleblowers logging 1–2 AM night dumpers (`HOT-*`) or roadside extortion (`INC-*`) must be tokenized (`ANON-*`) so phone numbers and flat addresses never reach crew or enforcement devices.
- **3-Tier Low-Cost Tagging (`TAG-*`):** Support painted compound stencils/QR stickers alongside optional 120L–360L bins and show verified `flood-access` weather reschedule notices cleanly during rainy season (`2.2m–2.7m` rains).

---

## 4. Alimosho–Orile Agege Pilot Focus for Residents

- **Gowon Estate (`LCDA-ALI-MOS`):** Demonstrates **Estate Group Discount (`3%–8%`)**, **CDA Block Coordinator Compound Billing**, and **FHA vs. LGA Drain Auto-Routing** inside `/report`.
- **Egbeda / Idimu / Ikotun (`LCDA-ALI-COR`, `LCDA-ALI-EGB`, `LCDA-ALI-IKO`):** Demonstrates **Multi-Flat Compound Split-Pay** (`₦1,500/flat` via USSD/Bank Transfer), **Tricycle Micro-Collector inner-lane badge** (replacing unapproved cart pushers), and **1–2 AM Blackspot Photo Reporting**.
- **Papa Ashafa II (`LCDA-ORA-PA2`, Orile Agege):** Demonstrates the **Revoked-PSP Continuity Experience**—Resident sees *"Guestimate Environmental Licence Withdrawn — Interim LAWMA Coverage Active · No Double Payment"* and continues receiving Friday collections seamlessly.
