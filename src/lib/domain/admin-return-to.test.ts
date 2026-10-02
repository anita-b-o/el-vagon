import { describe, expect, it } from "vitest";
import { adminReturnTo } from "./admin-return-to";

describe("adminReturnTo", () => {
  it("keeps the requested private route from Auth.js' callback URL", () => {
    expect(adminReturnTo("https://preview.example/admin/eventos?tab=orden")).toBe("/admin/eventos?tab=orden");
  });

  it("only permits local admin routes", () => {
    expect(adminReturnTo("https://example.test/")).toBe("/admin/reservas");
    expect(adminReturnTo("nota-url")).toBe("/admin/reservas");
    expect(adminReturnTo(["/admin/eventos"])).toBe("/admin/reservas");
  });
});
