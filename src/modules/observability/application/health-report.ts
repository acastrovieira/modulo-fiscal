import packageInfo from "../../../../package.json";
import { getAppEnvironment, type AppEnvironment } from "@/config/app-env";

export type HealthStatus = "ok" | "degraded";

export type HealthReport = {
  service: "vetfiscal-os";
  status: HealthStatus;
  environment: AppEnvironment;
  version: string;
  timestamp: string;
  checks: {
    api: "ok";
    databaseConfiguration: "configured" | "missing";
    sentryConfiguration: "configured" | "not_configured";
    queues: "not_enabled_in_mvp";
    nfseIssuance: "disabled_in_mvp";
  };
};

export type HealthReportOptions = {
  now?: Date;
  databaseUrl?: string;
  sentryDsn?: string;
  environment?: AppEnvironment;
  version?: string;
};

export function createHealthReport(options: HealthReportOptions = {}): HealthReport {
  const databaseConfigured = Boolean(options.databaseUrl ?? process.env.DATABASE_URL);
  const sentryConfigured = Boolean(options.sentryDsn ?? process.env.SENTRY_DSN);
  const status: HealthStatus = databaseConfigured ? "ok" : "degraded";

  return {
    service: "vetfiscal-os",
    status,
    environment: options.environment ?? getAppEnvironment(),
    version: options.version ?? packageInfo.version,
    timestamp: (options.now ?? new Date()).toISOString(),
    checks: {
      api: "ok",
      databaseConfiguration: databaseConfigured ? "configured" : "missing",
      sentryConfiguration: sentryConfigured ? "configured" : "not_configured",
      queues: "not_enabled_in_mvp",
      nfseIssuance: "disabled_in_mvp"
    }
  };
}
