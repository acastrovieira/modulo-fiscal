export type HealthCheck = {
  service: string;
  status: "ok" | "degraded" | "down";
  checkedAt: Date;
};
