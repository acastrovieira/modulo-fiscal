export function createCorrelationId(prefix = "corr"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
