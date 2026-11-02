import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ACCOUNTS, StoreProvider, useStore } from "@/lib/store";

const wrapper = ({ children }: { children: ReactNode }) => <StoreProvider account={ACCOUNTS[0]!}>{children}</StoreProvider>;
const pickup = (s: ReturnType<typeof useStore>, id: string) => s.model.customers.flatMap((c) => c.pickups).find((p) => p.id === id)!;

const wrapperCoastal = ({ children }: { children: ReactNode }) => <StoreProvider account={ACCOUNTS[1]!}>{children}</StoreProvider>;

describe("partner account scoping", () => {
  it("Mainland only sees Ikeja customers and Coastal only Lekki/Ajah", async () => {
    const a = renderHook(() => useStore(), { wrapper });
    const b = renderHook(() => useStore(), { wrapper: wrapperCoastal });
    await waitFor(() => expect(a.result.current.ready && b.result.current.ready).toBe(true));
    expect(new Set(a.result.current.model.customers.map((c) => c.area))).toEqual(new Set(["Ikeja"]));
    expect(new Set(b.result.current.model.customers.map((c) => c.area))).toEqual(new Set(["Lekki", "Ajah"]));
    expect(b.result.current.model.binRequests.every((r) => b.result.current.model.customers.some((c) => c.id === r.customerId))).toBe(true);
  });
});

describe("request status transitions", () => {
  beforeEach(() => localStorage.clear());

  it("cannot mark a still-requested pickup as collected", async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.setPickupStatus("PU-180002", "Collected"));
    expect(pickup(result.current, "PU-180002").status).toBe("Requested");
  });

  it("completing a collected pickup adds its amount to earnings due", async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.acceptRequest("PU-180002", "CREW-02", "Friday"));
    act(() => result.current.setPickupStatus("PU-180002", "Collected"));
    const before = result.current.model.earningsUncaptured;
    act(() => result.current.setPickupStatus("PU-180002", "Completed"));
    expect(pickup(result.current, "PU-180002").status).toBe("Completed");
    expect(result.current.model.earningsUncaptured).toBe(before + 1450);
  });

  it("cancelling a scheduled pickup refunds the customer", async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    const bal = result.current.model.customers.find((c) => c.id === "CUS-042-CHIOMA")!.balance;
    act(() => result.current.setPickupStatus("PU-104201", "Cancelled"));
    expect(result.current.model.customers.find((c) => c.id === "CUS-042-CHIOMA")!.balance).toBe(bal + 1500);
  });
});
