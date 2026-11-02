import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const input = z.object({
  accountName: z.string().min(1).max(120),
  events: z
    .array(
      z.object({
        time: z.string().max(40),
        location: z.string().max(120),
        device: z.string().max(120),
        ip: z.string().max(60),
        result: z.enum(["success", "failed"]),
      }),
    )
    .min(1)
    .max(60),
});

export const analyzeSecurity = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { analyzeSignIns } = await import("./security-ai.server");
    return analyzeSignIns(data.events, data.accountName, getRequest().signal);
  });
