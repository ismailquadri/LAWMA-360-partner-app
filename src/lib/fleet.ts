// Fleet telemetry (simulated) and LAWMA management regulation checks.
export type Vehicle = {
  crewId: string; plate: string; crewName: string;
  lng: number; lat: number; heading: number;
  speedKmh: number; loadPct: number;
  lastPingMin: number; // minutes since last GPS ping
  permitExpires: string; // ISO date
  lastInspection: string; // ISO date (roadworthiness)
  wasteCovered: boolean; // tarpaulin / closed body
  inZone: boolean; // inside assigned service area
};

export const RULES = {
  speedLimitKmh: 50,
  maxLoadPct: 100,
  maxPingGapMin: 10,
  inspectionDays: 90,
  hours: [6, 22] as const,
};

export type Violation = { code: string; label: string; severity: "high" | "medium" };

const days = (from: string, now: Date) => Math.floor((now.getTime() - new Date(from).getTime()) / 86_400_000);

export function checkCompliance(v: Vehicle, now = new Date()): Violation[] {
  const out: Violation[] = [];
  if (v.speedKmh > RULES.speedLimitKmh) out.push({ code: "SPEED", label: `Speeding · ${Math.round(v.speedKmh)} km/h (limit ${RULES.speedLimitKmh})`, severity: "high" });
  if (v.loadPct > RULES.maxLoadPct) out.push({ code: "OVERLOAD", label: `Overloaded · ${Math.round(v.loadPct)}%`, severity: "high" });
  if (!v.wasteCovered) out.push({ code: "UNCOVERED", label: "Waste load not covered", severity: "high" });
  if (new Date(v.permitExpires).getTime() < now.getTime()) out.push({ code: "PERMIT", label: "PSP operating permit expired", severity: "high" });
  if (days(v.lastInspection, now) > RULES.inspectionDays) out.push({ code: "INSPECTION", label: `Roadworthiness inspection overdue (${days(v.lastInspection, now)} days)`, severity: "medium" });
  if (v.lastPingMin > RULES.maxPingGapMin) out.push({ code: "GPS", label: `No GPS signal for ${v.lastPingMin} min`, severity: "medium" });
  if (!v.inZone) out.push({ code: "ZONE", label: "Operating outside assigned service area", severity: "medium" });
  const h = now.getHours();
  if (v.speedKmh > 0 && (h < RULES.hours[0] || h >= RULES.hours[1])) out.push({ code: "HOURS", label: "Moving outside permitted hours (6am–10pm)", severity: "medium" });
  return out;
}

const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

const BASE: Record<string, Omit<Vehicle, "crewName" | "plate">> = {
  "CREW-01": { crewId: "CREW-01", lng: 3.4747, lat: 6.4413, heading: 90, speedKmh: 34, loadPct: 62, lastPingMin: 1, permitExpires: iso(120), lastInspection: iso(-40), wasteCovered: true, inZone: true },
  "CREW-02": { crewId: "CREW-02", lng: 3.3515, lat: 6.6018, heading: 200, speedKmh: 57, loadPct: 88, lastPingMin: 2, permitExpires: iso(60), lastInspection: iso(-30), wasteCovered: true, inZone: true },
  "CREW-03": { crewId: "CREW-03", lng: 3.5852, lat: 6.4698, heading: 30, speedKmh: 0, loadPct: 104, lastPingMin: 14, permitExpires: iso(-3), lastInspection: iso(-120), wasteCovered: false, inZone: true },
};

export function seedFleet(crews: { id: string; name: string; plate: string }[]): Vehicle[] {
  return crews.map((c, i) => ({ ...(BASE[c.id] ?? { ...BASE["CREW-01"]!, crewId: c.id, lat: 6.5 + i * 0.01 }), crewName: c.name, plate: c.plate }));
}

/** Moves vehicles a little each tick to simulate live GPS. */
export function tick(fleet: Vehicle[]): Vehicle[] {
  return fleet.map((v) => {
    if (v.lastPingMin > RULES.maxPingGapMin || v.speedKmh === 0) return v;
    const heading = (v.heading + (Math.random() * 30 - 15) + 360) % 360;
    const step = (v.speedKmh / 3600) * 3 / 111; // ~3 s of travel, degrees
    const r = (heading * Math.PI) / 180;
    return { ...v, heading, lng: v.lng + Math.sin(r) * step * 4, lat: v.lat + Math.cos(r) * step * 4,
      speedKmh: Math.max(15, Math.min(65, v.speedKmh + (Math.random() * 8 - 4))) };
  });
}
