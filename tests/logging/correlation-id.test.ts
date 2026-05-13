import { describe, expect, it } from "vitest";
import { createCorrelationId } from "@/shared/logging/correlation-id";

describe("createCorrelationId", () => {
  it("creates unique prefixed identifiers", () => {
    const first = createCorrelationId("test");
    const second = createCorrelationId("test");

    expect(first).toMatch(/^test_[0-9a-f-]{36}$/);
    expect(second).toMatch(/^test_[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });
});
