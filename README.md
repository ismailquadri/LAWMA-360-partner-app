# LAWMA SmartWaste360 Partner

Partner console built with React, TanStack Start, Vite, and Nitro; deployed to Vercel.

## Development

Use Node.js 24, then run `npm ci` and `npm run dev`.
Run `npm test`, `npx tsc --noEmit`, and `npm run build` before deployment.
Nitro generates the Vercel Build Output API in `.vercel/output`.

## Backend status

Operational data, demo accounts, sign-in history, and attachments are stored in browser localStorage. Account switching is not authentication. Fleet telemetry is simulated. No database client, schema, migrations, or remote database credentials are present in this export. Live database migration requires access to the source database/export and a destination database; none has been migrated here.

AI security review runs on the server against OpenAI directly. Configure `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel to enable it. Neither is configured in this release. The existing input-limited endpoint is public and requires real authentication/rate limiting before exposing a paid provider to untrusted users.

Images are bundled in `public/assets`; there is no external asset-host dependency.

## Engineering & Product Documentation

Complete technical specifications, field research, street political economy, and stakeholder defense playbooks are available in [`docs/`](docs/):

- **[Product Requirements Document (PRD)](docs/PRD.md)**: Ward franchise management, two-tier fleet tracking (compactors + tricycles), compound split-billing ledger, bankable financial statements, and automated 80/20 Friday 5 PM escrow settlement.
- **[UX & Field Research](docs/research.md)**: 400+ PSP SME unit economics, diesel price volatility, route pirating, and equipment financing hurdles.
- **[Stakeholder Critiques & Concerns](docs/stakeholder-critiques-and-concerns.md)**: 35+ questions across 10 key Lagos stakeholders.
- **[Stakeholder Defense Master Playbook](docs/stakeholder-defense-answers.md)**: Executive defense scripts answering all critiques.
- **[Political Economy of the Streets](docs/political-economy-of-the-streets.md)**: Agbero tolls, illegal dump competition, diesel FVA adjustments, and AWAMN institutional relations.
- **[Cross-System Ecosystem Specs](docs/ecosystem-specs/)**: PRDs and data contracts for Workspace, Resident, and Operator apps.
