import { generateText } from "ai";

import type {
  AdapterExecutionContext,
  AdapterExecutionResult,
} from "@paperclipai/adapter-utils";

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readGatewayCost(
  metadata: Record<string, unknown> | undefined,
): number | null {
  if (!metadata) return null;

  const gateway = metadata.gateway;
  if (!gateway || typeof gateway !== "object") return null;

  const cost = (gateway as Record<string, unknown>).cost;

  if (typeof cost === "number" && Number.isFinite(cost)) {
    return cost;
  }

  if (typeof cost === "string") {
    const parsed = Number(cost);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function execute(
  ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  const model =
    asText(ctx.config.model) ||
    "openai/gpt-5.6-sol";

  const customInstructions = asText(ctx.config.systemPrompt);

  const taskTitle =
    asText(ctx.context.taskTitle) ||
    asText(ctx.context.title) ||
    "Continue your assigned work";

  const taskDescription =
    asText(ctx.context.taskDescription) ||
    asText(ctx.context.description);

  const prompt = [
    `You are ${ctx.agent.name}, an AI employee working inside Paperclip.`,
    `Company ID: ${ctx.agent.companyId}`,
    `Agent ID: ${ctx.agent.id}`,
    "",
    customInstructions
      ? `Your role instructions:\n${customInstructions}`
      : "",
    "",
    `Current task: ${taskTitle}`,
    taskDescription
      ? `Task details:\n${taskDescription}`
      : "",
    "",
    "Complete the task as effectively as possible.",
    "Return a clear work product and briefly state what you accomplished.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    ctx.onDispatch?.();

    await ctx.onMeta?.({
      adapterType: "northstar_ai",
      command: "vercel-ai-gateway",
      prompt,
      context: {
        model,
        taskTitle,
      },
    });

    const result = await generateText({
      model,
      prompt,
      providerOptions: {
        gateway: {
          user: ctx.agent.id,
          tags: [
            `company:${ctx.agent.companyId}`,
            `agent:${ctx.agent.id}`,
            `run:${ctx.runId}`,
          ],
        },
      },
    });

    await ctx.onLog(
      "stdout",
      `${result.text}\n`,
    );

    const costUsd = readGatewayCost(
      result.providerMetadata as Record<string, unknown> | undefined,
    );

    return {
      exitCode: 0,
      signal: null,
      timedOut: false,

      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
      },

      usageBasis: "per_run",
      provider: "vercel-ai-gateway",
      biller: "vercel",
      model,
      billingType: "metered_api",
      costUsd,
      cacheAdjustedCostUsd: costUsd,

      summary: result.text.slice(0, 1000),

      resultJson: {
        text: result.text,
        finishReason: result.finishReason,
        model,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    await ctx.onLog(
      "stderr",
      `NorthStar AI execution failed: ${message}\n`,
    );

    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: message,
      provider: "vercel-ai-gateway",
      model,
      billingType: "metered_api",
    };
  }
}
