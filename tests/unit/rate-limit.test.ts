import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("Process-local Rate Limiter", () => {
  it("allows requests within the limit", () => {
    const key = `test-ip-${Date.now()}`;
    const first = rateLimit(key, 3, 5000);
    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(2);

    const second = rateLimit(key, 3, 5000);
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(1);

    const third = rateLimit(key, 3, 5000);
    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks requests once limit is exceeded", () => {
    const key = `blocked-ip-${Date.now()}`;
    rateLimit(key, 2, 5000);
    rateLimit(key, 2, 5000);

    const blocked = rateLimit(key, 2, 5000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
