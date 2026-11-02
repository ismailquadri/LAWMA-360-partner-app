import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

export const reportSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  findings: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      evidence: z.string(),
      explanation: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
});
export type SecurityReport = z.infer<typeof reportSchema>;

export type SignInInput = { time: string; location: string; device: string; ip: string; result: "success" | "failed" };

const INSTRUCTIONS = `You are a security analyst for LAWMA SmartWaste360, reviewing sign-in activity for one waste-collection partner (PSP) account.
Identify suspicious access patterns such as: impossible travel (distant locations too close in time), repeated failed attempts or password guessing, sign-ins from unfamiliar countries, new or unusual devices, odd-hour access, anonymising networks.
Explain each risk in plain, non-technical English for operations staff. Cite the specific sign-ins (time, location, device) as evidence.
Give practical next steps (e.g. change password, review who has access, contact LAWMA support). If nothing looks wrong, say so with riskLevel "low" and no invented findings.
Times are ISO 8601 UTC; local business is in Lagos (UTC+1).`;

export async function analyzeSignIns(events: SignInInput[], accountName: string, signal?: AbortSignal) {
  const apiKey = process.env["OPENAI_API_KEY"];
  const model = process.env["OPENAI_MODEL"];
  if (!apiKey || !model) return { error: "AI is not configured for this app yet." } as const;

  let lastStatus = 0;
  const provider = createOpenAI({
    apiKey,
    fetch: async (input, init) => {
      const res = await fetch(input, init);
      if (!res.ok) lastStatus = res.status;
      return res;
    },
  });

  const result = streamText({
    model: provider.responses(model),
    system: INSTRUCTIONS,
    messages: [
      { role: "user", content: `Account: ${accountName}\nSign-in activity (newest first):\n${JSON.stringify(events, null, 1)}` },
    ],
    output: Output.object({ schema: reportSchema }),
    maxRetries: 0,
    ...(signal ? { abortSignal: signal } : {}),

  });

  try {
    const report = await result.output;
    return { report } as const;
  } catch (err) {
    console.error("security analysis failed", lastStatus, err);
    if (lastStatus === 402) return { error: "AI billing needs attention. Contact your administrator." } as const;
    if (lastStatus === 429) return { error: "Too many requests right now. Wait a minute and try again." } as const;
    if (lastStatus === 403) return { error: "AI access is blocked for this workspace. An administrator needs to review the AI provider settings." } as const;
    if (NoObjectGeneratedError.isInstance(err)) return { error: "The AI couldn't produce a report this time." } as const;
    return { error: "The security check could not be completed. Please try again." } as const;
  }
}
