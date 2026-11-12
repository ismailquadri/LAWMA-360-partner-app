# LAWMA SmartWaste360 Partner — Documentation Suite

Welcome to the engineering documentation suite for **LAWMA SmartWaste360 Partner**.

## System Overview
- **System Role:** AWAMN 400+ PSP SME Back-Office Operations & Fleet Management Console
- **Ecosystem Domain:** Solid Waste Management in Lagos State under the **2017 Environmental Management and Protection Law (EMPL)** & **Polluter-Pay Policy**.
- **System Summary:** Ward-based franchise management, two-tier fleet tracking (compactors + tricycles), compound split-billing ledger, bankable financial statements, and automated 80/20 Friday 5 PM escrow settlement.

---

## 📑 Core Documentation Index

This repository contains the complete specification, research, political economy, and stakeholder defense documents required to implement and operate this system without missing any functional, operational, or legal requirements:

1. **[Product Requirements Document (PRD.md)](PRD.md)**  
   *The definitive functional and technical specification for this application.*
   - Canonical entity models, state machines, API contracts, and offline resilience protocols.
   - Specific user journeys, acceptance criteria, error handling, and performance SLAs.

2. **[UX & Field Research Report (research.md)](research.md)**  
   *Deep-dive ethnographic and technical field research conducted in Lagos State.*
   - Operator and citizen pain points, connectivity constraints (2G/3G edge fallbacks), physical street realities, and behavioral patterns.

3. **[Stakeholder Critiques & Concerns (stakeholder-critiques-and-concerns.md)](stakeholder-critiques-and-concerns.md)**  
   *Exhaustive 35+ question critique dossier embodying 10 key Lagos stakeholders.*
   - Detailed operational, financial, legal, and political challenges from Governor Babajide Sanwo-Olu, Hon. Comm. Tokunbo Wahab, MD Dr. Muyiwa Gbadegesin, AWAMN PSPs, Conference 57 LGAs, Market Iyalojas, Informal Cartels, Citizens, LIRS, and the Judiciary.

4. **[Stakeholder Defense Master Playbook (stakeholder-defense-answers.md)](stakeholder-defense-answers.md)**  
   *Word-for-word executive defense scripts and statutory answers to all 35+ stakeholder critiques.*
   - Explains exactly how the technical and economic design answers every criticism, prevents fraud, protects revenue, and enforces statutory compliance.

5. **[The Political Economy of the Streets (political-economy-of-the-streets.md)](political-economy-of-the-streets.md)**  
   *Comprehensive structural analysis of the 5 Power Blocs and 9 street pillars.*
   - Essential domain reading: Market Iyalojas, Agbero toll-points, Wole-Wole health inspectors, Scavenger Baba Oja cartels, Diesel price volatility, POS agent fees, Midnight cartels, Biohazard containment, and Solous II laterite capping.

---

## 🌐 Complete Ecosystem Specifications

For cross-system data contracts (`hub-contract.ts` v2), inter-app messaging, and end-to-end integration across all 4 LAWMA applications, refer to the [ecosystem-specs/](ecosystem-specs/) directory:

- **Workspace (Regulator Command & Clearinghouse):** [PRD](ecosystem-specs/PRD-Workspace.md) | [Research](ecosystem-specs/research-Workspace.md)
- **Partner (AWAMN 400+ PSP Back-Office):** [PRD](ecosystem-specs/PRD-Partner.md) | [Research](ecosystem-specs/research-Partner.md)
- **Operator (Rugged Field Collection Crew):** [PRD](ecosystem-specs/PRD-Operator.md) | [Research](ecosystem-specs/research-Operator.md)
- **Resident (Citizen & Compound Customer App):** [PRD](ecosystem-specs/PRD-Resident.md) | [Research](ecosystem-specs/research-Resident.md)
