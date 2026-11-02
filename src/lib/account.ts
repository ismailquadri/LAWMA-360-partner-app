import { createContext, useContext } from "react";
import type { PartnerAccount } from "./store";

export const AccountContext = createContext<{ account: PartnerAccount; switchTo: (id: string) => void; signOut: () => void } | null>(null);
export function useAccount() {
  const v = useContext(AccountContext);
  if (!v) throw new Error("AccountContext missing");
  return v;
}
