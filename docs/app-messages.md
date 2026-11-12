# LAWMA 360 App Messages (Contract v2)

The customer app hosts a small message hub. The Partner Hub, LAWMA Workspace,
and Operator Handheld Scanner talk to it over HTTP.

Base URL: `https://smartwaste360-mobile.vercel.app`

Every request sends header `x-app-key: <PARTNER_APP_KEY | LAWMA_APP_KEY | OPERATOR_APP_KEY>`.

## Read your inbox

`GET /api/public/messages?since=<created_at of last message>` →
`{ app, messages: [{ id, from_app, to_app, type, customer_id, ref, payload, created_at }] }`

Poll every ~5 seconds, keep the last `created_at` as the cursor, ignore ids already seen.
Each message's `payload.customer` carries `{ name, phone, address, area, premiseId, partnerId }`.

## Send a message

`POST /api/public/messages` with JSON
`{ "to": ["customer"], "type": "pickup.status", "customerId": "CUS-…", "ref": "PU-…", "payload": { … } }`

## Message Matrix by Application Role

### 1. Customer → Partner / LAWMA / Operator
| type | to | payload |
| --- | --- | --- |
| customer.registered | lawma | — |
| partner.selected | partner, lawma | partnerId, partnerName |
| bin.requested | partner | binId, size, kind (new / additional) |
| pickup.requested | partner | pickupId, amount, window, partnerId |
| pickup.cancelled | partner | pickupId |
| wallet.topup | partner, lawma | amount, method, balance |
| issue.reported | partner, lawma | issueId, type (category), detail, title?, urgency? (low/medium/high) |
| provider_change.requested | lawma, partner | fromPartnerId, toPartnerId, toPartnerName |

### 2. Operator → Partner / LAWMA / Customer (New in v2)
| type | to | payload |
| --- | --- | --- |
| pickup.scanned | customer, partner, lawma | tagId (TAG-HH-*), routeId, time, gps: {lat, lng}, photoProofUri |
| pickup.arrears_override | partner, lawma | tagId, arrearsAmount, overrideSupervisorId, reason ("Resident committed to Friday partial pay") |
| pickup.rejected_biohazard| customer, partner, lawma | tagId, reason ("Contaminated sharps/clinical"), photoEvidenceUri, incidentRef (INC-BIO-*) |
| tls.weighed | partner, lawma | ticketId (TCK-AGE-*), truckId, grossKg, tareKg, netKg, destination (DS-SOL) |

### 3. Partner / LAWMA → Customer / Operator
| type | from | payload |
| --- | --- | --- |
| pickup.status | partner | pickupId, status (Accepted, Scheduled, Collected, Completed, Declined), window?, crew?, note? |
| bin.status | partner | binId, status (Approved, Out for delivery, Delivered, Active, Declined) |
| issue.update | partner, lawma | issueId, status (Open, In review, Resolved), reply |
| provider_change.decision | lawma | approved (true/false), note? |
| notice.sent | partner, lawma | text |
| corridor.broadcast | lawma | corridorId, alert ("Rainy season surge: Solous II 45m SLA queue limit active") |

## Financial Clearinghouse Invariants
1. **Pickup Escrow Hold:** Pickup charges are held in escrow when requested.
2. **Collection Verification:** An operator scan (`pickup.scanned`) or partner verified collection transitions status to `Collected`.
3. **Friday 5:00 PM Settlement:** 80% disbursed to PSP partner account, 20% retained by LAWMA clearinghouse.
4. **Saturday 12:00 WAT SLA Protection:** If a scheduled Friday pickup has no matching operator scan by Saturday noon, escrow is frozen and resident receives full cycle credit.
