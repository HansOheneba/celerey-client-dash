import type { FinancialSnapshot } from "@/lib/celerey-ai-local";

export type DeepSeekChatRole = "system" | "user" | "assistant";

export type DeepSeekChatMessage = {
  role: DeepSeekChatRole;
  content: string;
};

function getApiKey(): string | undefined {
  return process.env.DEEPSEEK_API_KEY?.trim() || undefined;
}

function getBaseUrl(): string {
  return (
    process.env.DEEPSEEK_BASE_URL?.replace(/\/$/, "") ||
    "https://api.deepseek.com"
  );
}

function getModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(getApiKey());
}

export function isDemoAiEnabled(): boolean {
  return process.env.DEMO_AI_ENABLED === "true";
}

function formatSnapshotForPrompt(snapshot: FinancialSnapshot): string {
  const context = {
    profile: {
      firstName: snapshot.firstName,
      currentAge: snapshot.currentAge,
      riskProfile: snapshot.riskProfile,
      profileCompletionScore: snapshot.profileCompletionScore,
    },
    netWorth: snapshot.netWorth,
    monthlyIncome: snapshot.monthlyIncome,
    monthlyExpenses: snapshot.monthlyExpenses,
    surplus: snapshot.surplus,
    savingsRatePct: snapshot.savingsRatePct,
    portfolioValue: snapshot.portfolioValue,
    propertyEquity: snapshot.propertyEquity,
    propertyCount: snapshot.propertyCount,
    totalDebt: snapshot.totalDebt,
    standaloneDebt: snapshot.standaloneDebt,
    creditCardBalance: snapshot.creditCardBalance,
    creditCardRate: snapshot.creditCardRate,
    topDebt: snapshot.topDebt
      ? {
          name: snapshot.topDebt.name,
          balance: snapshot.topDebt.balance,
          interestRatePct: snapshot.topDebt.interestRatePct,
          type: snapshot.topDebt.type,
        }
      : null,
    emergencyBalance: snapshot.emergencyBalance,
    emergencyRunwayMonths: snapshot.emergencyRunwayMonths,
    emergencyTargetMonths: snapshot.emergencyTargetMonths,
    retirement: {
      retirementAge: snapshot.retirementAge,
      currentInvested: snapshot.currentInvested,
      monthlySavings: snapshot.monthlySavings,
      desiredMonthlyIncome: snapshot.desiredMonthlyIncome,
      projectedRetirement: snapshot.projectedRetirement,
      retirementOnTrack: snapshot.retirementOnTrack,
    },
    insurance: {
      policyCount: snapshot.insurancePolicies,
      monthlyPremium: snapshot.monthlyInsurancePremium,
      uninsuredProperties: snapshot.uninsuredProperties.map((p) => ({
        name: p.name,
        marketValue: p.market_value,
      })),
    },
    goals: snapshot.activeGoals.map((g) => ({
      title: g.title,
      target: g.target,
      current: g.current ?? 0,
      completed: g.completed,
    })),
    topGoal: snapshot.topGoal
      ? {
          title: snapshot.topGoal.title,
          target: snapshot.topGoal.target,
          current: snapshot.topGoal.current ?? 0,
        }
      : null,
    tax: {
      effectiveTaxRate: snapshot.effectiveTaxRate,
    },
    holdings: {
      count: snapshot.holdingsCount,
      largest: snapshot.largestHolding
        ? {
            name: snapshot.largestHolding.name,
            assetType: snapshot.largestHolding.asset_type,
          }
        : null,
    },
    liabilities: snapshot.liabilities.map((l) => ({
      name: l.name,
      balance: l.balance,
      interestRatePct: l.interestRatePct,
      type: l.type,
    })),
  };

  return JSON.stringify(context, null, 2);
}

export function buildRagSystemPrompt(
  snapshot: FinancialSnapshot,
  options?: { isDemo?: boolean },
): string {
  const demoNote = options?.isDemo
    ? "The user is exploring a demo profile with sample data."
    : "The user is viewing their live Celerey financial profile.";

  return `You are Celerey AI, a warm and clear financial clarity coach inside the Celerey client dashboard.

${demoNote}

Your job is to help the user understand their finances: numbers, tradeoffs, gaps, and what questions to ask next. You are NOT a licensed financial, tax, legal, or investment advisor.

RULES (follow strictly):
1. Ground every answer in the FINANCIAL_SNAPSHOT below. Cite specific figures from it.
2. If the snapshot lacks data for a question, say what is missing and suggest adding it in Celerey. Never invent numbers.
3. Do NOT provide financial, tax, legal, or investment advice. Do NOT recommend specific buy/sell/hold actions, securities, or products.
4. When the user asks what they should do, frame options and tradeoffs for clarity - not prescriptions.
5. When a question needs professional judgment, say: "For personalised financial advice, book a session with a Celerey advisor."
6. Use **bold** around key figures and labels (the UI renders markdown-style bold).
7. Keep replies concise: 2-4 short paragraphs unless the user asks for detail.
8. On the FIRST reply of a conversation, end with one sentence: "This is educational guidance only, not financial advice."

FINANCIAL_SNAPSHOT:
${formatSnapshotForPrompt(snapshot)}`;
}

export async function createChatCompletionStream(
  messages: DeepSeekChatMessage[],
): Promise<Response> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  const response = await fetch(`${getBaseUrl()}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      temperature: 0.4,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `DeepSeek request failed (${response.status})${errorBody ? `: ${errorBody.slice(0, 200)}` : ""}`,
    );
  }

  if (!response.body) {
    throw new Error("DeepSeek returned an empty stream.");
  }

  return response;
}

export function pipeOpenAiStreamToSse(
  upstream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
                );
              }
            } catch {
              // Skip malformed SSE chunks.
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
