import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { FinancialSnapshot } from "@/lib/celerey-ai-local";
import {
  buildRagSystemPrompt,
  createChatCompletionStream,
  isDeepSeekConfigured,
  isDemoAiEnabled,
  pipeOpenAiStreamToSse,
} from "@/lib/deepseek";
import { SESSION_TOKEN_COOKIE } from "@/lib/onboarding/token";

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatTurnSchema).min(1).max(40),
  snapshot: z.record(z.string(), z.unknown()),
  isDemo: z.boolean().optional(),
});

function hasSession(req: NextRequest): boolean {
  return Boolean(req.cookies.get(SESSION_TOKEN_COOKIE)?.value);
}

export async function POST(req: NextRequest) {
  if (!isDeepSeekConfigured()) {
    return NextResponse.json(
      { error: "AI service is not configured." },
      { status: 503 },
    );
  }

  let body: z.infer<typeof chatRequestSchema>;
  try {
    body = chatRequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const isDemo = body.isDemo === true;
  const authed = hasSession(req);

  if (!authed && !(isDemo && isDemoAiEnabled())) {
    return NextResponse.json(
      { error: "Unauthorized - session expired." },
      { status: 401 },
    );
  }

  const snapshot = body.snapshot as FinancialSnapshot;
  const systemPrompt = buildRagSystemPrompt(snapshot, { isDemo });

  try {
    const upstream = await createChatCompletionStream([
      { role: "system", content: systemPrompt },
      ...body.messages,
    ]);

    const stream = pipeOpenAiStreamToSse(upstream.body!);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
