import { describe, expect, it } from "vitest";
import { isAllowedAdminProfile } from "./admin-auth";

describe("Google admin allowlist", () => {
  it("allows only the verified configured email", () => {
    expect(isAllowedAdminProfile({ email: "Admin@Example.com", email_verified: true }, "admin@example.com")).toBe(true);
    expect(isAllowedAdminProfile({ email: "other@example.com", email_verified: true }, "admin@example.com")).toBe(false);
    expect(isAllowedAdminProfile({ email: "admin@example.com", email_verified: false }, "admin@example.com")).toBe(false);
  });
});
