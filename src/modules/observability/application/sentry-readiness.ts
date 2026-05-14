export type SentryReadiness = {
  enabled: false;
  configured: boolean;
  reason: "future_integration";
  requiredEnv: "SENTRY_DSN";
};

export function getSentryReadiness(input: { sentryDsn?: string } = {}): SentryReadiness {
  return {
    enabled: false,
    configured: Boolean(input.sentryDsn ?? process.env.SENTRY_DSN),
    reason: "future_integration",
    requiredEnv: "SENTRY_DSN"
  };
}
