import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedAdminProfile } from "./admin-auth";

describe("Google admin allowlist", () => {
  const allowedEmails = "current@example.com, elvagongbelgrano.2024@gmail.com";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows each verified configured email", () => {
    expect(isAllowedAdminProfile(
      { email: "Current@Example.com", email_verified: true },
      allowedEmails,
    )).toBe(true);
    expect(isAllowedAdminProfile(
      { email: "elvagongbelgrano.2024@gmail.com", email_verified: true },
      allowedEmails,
    )).toBe(true);
  });

  it("rejects accounts outside the allowlist", () => {
    expect(isAllowedAdminProfile(
      { email: "other@example.com", email_verified: true },
      allowedEmails,
    )).toBe(false);
  });

  it("rejects an unverified configured account", () => {
    expect(isAllowedAdminProfile(
      { email: "current@example.com", email_verified: false },
      allowedEmails,
    )).toBe(false);
  });

  it("combines the legacy admin with the multi-email allowlist", () => {
    vi.stubEnv("ADMIN_GOOGLE_EMAIL", "current@example.com");
    vi.stubEnv("ADMIN_GOOGLE_EMAILS", "elvagongbelgrano.2024@gmail.com");

    expect(isAllowedAdminProfile({
      email: "current@example.com",
      email_verified: true,
    })).toBe(true);
    expect(isAllowedAdminProfile({
      email: "elvagongbelgrano.2024@gmail.com",
      email_verified: true,
    })).toBe(true);
    expect(isAllowedAdminProfile({
      email: "outsider@example.com",
      email_verified: true,
    })).toBe(false);
  });
});
