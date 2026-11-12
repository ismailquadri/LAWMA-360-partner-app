# Partner App API & Message Contract

**Target Application:** `LAWMA-360-partner-app`  
**Endpoint:** `/api/public/messages`  
**Authentication Header:** `x-app-key: PARTNER_APP_KEY`

---

## Inbound Messages (Customer / Operator / LAWMA -> Partner)

| Type | Source | Payload | Description |
| :--- | :--- | :--- | :--- |
| `pickup.requested` | `customer` | `{ pickupId, premiseId, amountHeldEscrow }` | Customer requested collection or bulk waste. |
| `pickup.scanned` | `operator` | `{ tagId, timestamp, gps, photoProofUri }` | Field crew verified collection at household gate. |
| `pickup.arrears_override` | `operator` | `{ tagId, arrearsAmount, crewId }` | Field crew partial arrears override at gate. |
| `tls.weighed` | `operator` | `{ ticketId, grossKg, tareKg, netKg }` | Scale ticket from Agege TLS or Solous II. |
| `escrow.settled` | `lawma` | `{ batchId, grossAmount, net80Amount, bankRef }` | Friday 5:00 PM bank remittance notification. |

---

## Outbound Messages (Partner -> Operator / Customer / LAWMA)

### 1. `route.assigned`
Dispatches daily route manifest to crew handheld terminals:
```json
{
  "to": ["operator"],
  "type": "route.assigned",
  "ref": "ROU-ALI-2026-11-13",
  "payload": {
    "partnerId": "PAR-ALI-002",
    "routeId": "ROU-ALI-001",
    "wardCode": "LCDA-ALI-MOS",
    "assignedTruckId": "TRK-ALI-012",
    "crewId": "CREW-ALI-04",
    "stopsCount": 142,
    "manifestHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

### 2. `pickup.status`
Updates customer on scheduled collection status:
```json
{
  "to": ["customer"],
  "type": "pickup.status",
  "customerId": "CUS-ALI-0148",
  "ref": "PU-2026-11-12-004",
  "payload": {
    "pickupId": "PU-2026-11-12-004",
    "status": "Scheduled",
    "window": "Friday Morning (08:00 - 12:00)",
    "crew": "Crew 04 (Alimosho West)",
    "truckPlate": "KRD-492-XA"
  }
}
```
