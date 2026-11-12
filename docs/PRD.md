# PRD: LAWMA 360 Partner Hub (`Partner`)

**Document Version:** 2.0 (System-Specific Specification)  
**System Role:** AWAMN 400+ PSP SME Back-Office Operations & Fleet Management Console  
**Target Codebase:** `LAWMA-360-partner-app` (`src/routes/`, `src/components/`, `src/lib/`)  
**Deployment Target:** Desktop & Tablet Web Console (Vercel Nitro)  

---

## 1. System Vision & Purpose

`Partner` is the dedicated operating system built for the **400+ accredited Private Sector Participation (PSP) waste management SMEs** organized under the **Association of Waste Managers of Nigeria (AWAMN)**. It provides:
1. **Franchise Ward Protection:** Exclusive digital mapping of allocated wards (`PAR-*`), preventing route pirating and territorial disputes under Section 71 of the 2017 EMPL.
2. **Automated 80/20 Friday Escrow Settlement:** Direct bank disbursement of 80% of net verified collections every Friday at 5:00 PM without manual government payment vouchers.
3. **Two-Tier Fleet Operations:** Integrated routing for heavy compactor trucks on primary roads and tricycle mini-tippers in narrow, unpaved inner lanes.
4. **Bankable Remittance Statements:** Certified 12-month audited revenue reports designed to satisfy commercial bank underwriting requirements for compactor truck acquisition loans.
5. **Dynamic Fuel Variance Adjustment (FVA):** Automated operational margin calculation tracking diesel price fluctuations against approved tenement tariff bands.

---

## 2. Core Functional Modules

### Module 1: Ward Route & Street Asset Registry (`PAR-*`)
- **Territorial Invariant:** Each PSP SME manages an exclusive contract zone (e.g. `PAR-ALI-002` covering Mosan-Okunola / Gowon Estate).
- **Anti-Pirating Geofence:** Compactor telematics units verify that collections occur strictly within the assigned ward boundaries; scans attempted outside the zone raise route alerts.
- **Street Directory:** Pre-loaded database of registered domestic properties (`PROP-RES-*`), commercial shops (`PROP-MKT-*`), and communal skips (`TAG-SKIP-*`).

### Module 2: Two-Tier Fleet & Crew Dispatching
- **Heavy Compactors (Primary Routes):** Real-time GPS/telematics tracking of 15–20 ton compactors covering primary avenues (e.g. 41 Road, Akowonjo Road).
- **Tricycle Micro-Collectors (Inner Lanes):** Dispatch and management of 3-wheeled motorized tippers servicing narrow streets inaccessible to heavy trucks.
- **Handoff Logistics:** Tracks consolidation skips where tricycles deposit localized collections for bulk compactor transfer.

### Module 3: Compound Tenancy & Split-Billing Ledger
- **Compound Management:** Monitors compound subscription rates and payment compliance across multi-tenant houses.
- **Selective Arrears Action:** Distinguishes compliant flats from defaulting units, eliminating the need to withdraw service from an entire compound.
- **Tag Provisioning:** Issues and manages physical barcode/RFID tags (`TAG-HH-*`) assigned to household bins.

### Module 4: Automated 80/20 Escrow Clearinghouse Settlement
- **Escrow Invariant:** Resident payments sit in a ring-fenced commercial bank escrow account.
- **Remittance Split:**
  - **80%** disbursed directly to the PSP SME's corporate bank account.
  - **20%** retained by LAWMA for regulatory oversight, transfer station operation, and dumpsite subvention.
- **Friday 5:00 PM Settlement Rail:** Automated NIP batch transfer executes every Friday afternoon upon matching operator collection scans (`pickup.scanned`).

### Module 5: Bankable Financial Reports & Asset Financing
- **The Financing Barrier:** Commercial banks historically reject PSP loan applications due to informal paper billing books.
- **Automated Audit Engine:** Generates monthly bankable financial statements certified with LAWMA digital signatures, displaying:
  - 12-month verified collection volume (MT)
  - Historical billing yield and collection efficiency (%)
  - Escrow remittance track record and debt coverage ratio
- **Target Products:** Pre-configured for Bank of Industry (BOI) and commercial bank equipment lease schemes.

### Module 6: Fuel Variance Adjustment (FVA) Calculator
- Monitors local diesel prices (₦/liter).
- Calculates the cost-per-ton fuel coefficient based on route distance and compactor fuel consumption.
- Recommends temporary regulatory fuel subventions when diesel prices spike $> 15\%$, protecting operator solvency.
