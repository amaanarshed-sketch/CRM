import { describe, expect, it } from "vitest";
import { checkRateLimit, getRateLimitKey } from "../rate-limit";

describe("rate-limit", () => {
  it("allows requests until the configured limit is reached", () => {
    const key = `test:${crypto.randomUUID()}`;

    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });

  it("uses forwarded IP headers when available", () => {
    const request = new Request("https://leadloop.test/api/follow-up-message", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" }
    });

    expect(getRateLimitKey(request, "messages")).toBe("messages:203.0.113.10");
  });
});
