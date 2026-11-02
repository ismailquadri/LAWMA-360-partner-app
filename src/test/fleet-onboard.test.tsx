import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ACCOUNTS, StoreProvider, useStore } from "@/lib/store";
import { checkCompliance, type Vehicle } from "@/lib/fleet";

const ok: Vehicle = { crewId: "C", plate: "LND 1 A", crewName: "C", lng: 3.4, lat: 6.5, heading: 0, speedKmh: 40, loadPct: 80, lastPingMin: 1, permitExpires: "2099-01-01", lastInspection: new Date().toISOString().slice(0, 10), wasteCovered: true, inZone: true };
const noon = new Date(); noon.setHours(12, 0, 0, 0);
const codes = (v: Partial<Vehicle>) => checkCompliance({ ...ok, ...v }, noon).map((x) => x.code);

describe("fleet regulations", () => {
  it("a vehicle within all rules is compliant", () => expect(codes({})).toEqual([]));
  it("flags speed above 50 km/h", () => expect(codes({ speedKmh: 51 })).toEqual(["SPEED"]));
  it("flags load above 100%", () => expect(codes({ loadPct: 101 })).toEqual(["OVERLOAD"]));
  it("flags an expired permit", () => expect(codes({ permitExpires: "2000-01-01" })).toEqual(["PERMIT"]));
  it("flags GPS silent over 10 minutes", () => expect(codes({ lastPingMin: 11 })).toEqual(["GPS"]));
});

describe("customer onboarding", () => {
  beforeEach(() => localStorage.clear());
  it("adds the customer and a pending bin request", async () => {
    const { result } = renderHook(() => useStore(), { wrapper: ({ children }: { children: ReactNode }) => <StoreProvider account={ACCOUNTS[0]!}>{children}</StoreProvider> });
    await waitFor(() => expect(result.current.ready).toBe(true));
    let id = "";
    act(() => { id = result.current.addCustomer({ name: "Bisi Adeyemi", phone: "08030000000", address: "2 Allen Ave", area: "Ikeja", binSize: 240 }).id; });
    expect(result.current.model.customers[0]!.id).toBe(id);
    expect(result.current.model.binRequests.find((b) => b.customerId === id)?.status).toBe("Pending");
  });
});
