import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { checkPassword, signSession, verifySession, SESSION_MAX_AGE } =
  await import("./session");

beforeEach(() => {
  vi.stubEnv("APP_PASSWORD", "pikachu");
  vi.stubEnv("SESSION_SECRET", "test-secret");
});

describe("checkPassword", () => {
  it("accepts only the right password", () => {
    expect(checkPassword("pikachu")).toBe(true);
    expect(checkPassword("pikach")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });

  it("rejects everything when no password is set", () => {
    vi.stubEnv("APP_PASSWORD", "");
    expect(checkPassword("")).toBe(false);
  });
});

describe("sessions", () => {
  it("verifies its own token until it expires", () => {
    const token = signSession(0);
    expect(verifySession(token, 1)).toBe(true);
    expect(verifySession(token, SESSION_MAX_AGE * 1000)).toBe(false);
  });

  it("rejects tampered, foreign and missing tokens", () => {
    const [expiry, sig] = signSession().split(".");
    expect(verifySession(`${Number(expiry) + 1}.${sig}`)).toBe(false);
    expect(verifySession(`${expiry}.x${sig}`)).toBe(false);
    expect(verifySession(expiry)).toBe(false);
    expect(verifySession(undefined)).toBe(false);
    const token = signSession();
    vi.stubEnv("SESSION_SECRET", "other");
    expect(verifySession(token)).toBe(false);
  });
});
