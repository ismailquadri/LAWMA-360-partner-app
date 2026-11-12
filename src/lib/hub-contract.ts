import { z } from "zod";

// Shared message contract between the Customer App, Partner Hub, Operator Handheld,
// and the LAWMA Management Workspace. Keep in sync with docs/app-messages.md.
export const APPS = ["customer", "partner", "operator", "lawma"] as const;
export type AppName = (typeof APPS)[number];

export const appName = z.enum(APPS);

export const outgoingMessage = z.object({
  to: z.array(appName).min(1).max(3),
  type: z.string().min(2).max(60).regex(/^[a-z_]+\.[a-z_]+$/),
  customerId: z.string().min(6).max(80).optional(),
  ref: z.string().max(80).optional(),
  payload: z.record(z.unknown()).default({}),
});
export type OutgoingMessage = z.infer<typeof outgoingMessage>;

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export type HubMessage = {
  id: string;
  from_app: AppName;
  to_app: AppName;
  type: string;
  customer_id: string | null;
  ref: string | null;
  payload: { [k: string]: Json };
  created_at: string;
};

/** Decide which app a request key belongs to. Returns null when it matches none. */
export function appForKey(
  key: string | null | undefined,
  keys: { partner?: string | undefined; lawma?: string | undefined; operator?: string | undefined },
): AppName | null {
  if (!key || key.length < 8) return null;
  if (keys.partner && key === keys.partner) return "partner";
  if (keys.lawma && key === keys.lawma) return "lawma";
  if (keys.operator && key === keys.operator) return "operator";
  return null;
}

/** An app may never send a message to itself. */
export function recipientsFor(from: AppName, to: AppName[]): AppName[] {
  return Array.from(new Set(to)).filter((t) => t !== from);
}
