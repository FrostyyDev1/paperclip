import type {
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks = [];

  const hasGatewayKey =
    Boolean(process.env.AI_GATEWAY_API_KEY);

  const hasOidc =
    Boolean(process.env.VERCEL_OIDC_TOKEN);

  if (hasGatewayKey) {
    checks.push({
      code: "gateway_key_found",
      level: "info" as const,
      message: "AI Gateway API key detected.",
    });
  } else if (hasOidc) {
    checks.push({
      code: "gateway_oidc_found",
      level: "info" as const,
      message: "Vercel OIDC credentials detected.",
    });
  } else {
    checks.push({
      code: "gateway_auth_missing",
      level: "error" as const,
      message: "No Vercel AI Gateway credentials detected.",
      hint: "Set AI_GATEWAY_API_KEY before starting Paperclip.",
    });
  }

  return {
    adapterType: ctx.adapterType,
    status:
      hasGatewayKey || hasOidc
        ? "pass"
        : "fail",
    checks,
    testedAt: new Date().toISOString(),
  };
}
