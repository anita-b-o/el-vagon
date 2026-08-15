import { describe, expect, it } from "vitest";
import { parseLocalDate } from "./dates";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "./whatsapp";

describe("WhatsApp handoff", () => {
  const base = {
    startDate: parseLocalDate("2026-09-20"),
    endDate: parseLocalDate("2026-09-23"),
    fullName: "Ana Pérez",
    guestCount: 2,
  };

  it("builds the complete encoded message", () => {
    const message = buildWhatsAppMessage({ ...base, question: "¿Podemos llegar después de las 18 hs?" });
    expect(message).toContain("Estadía: 3 noches");
    expect(message).toContain("Consulta:\n¿Podemos llegar");
    expect(decodeURIComponent(buildWhatsAppUrl(message))).toContain(message);
  });

  it("does not emit an empty question section", () => {
    expect(buildWhatsAppMessage({ ...base, question: "  " })).not.toContain("Consulta:");
  });
});
