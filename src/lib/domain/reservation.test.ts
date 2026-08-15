import { describe, expect, it } from "vitest";
import { reservationRequestSchema, validateStayRange } from "./reservation";

const now = new Date("2026-08-15T15:00:00Z");
const valid = {
  clientRequestId: "0db4505f-e864-4bec-8183-b1372bf221d5",
  fullName: "Ana Pérez",
  guestCount: 2,
  checkIn: "2026-09-20",
  checkOut: "2026-09-23",
};

describe("reservation requests", () => {
  it("accepts a valid request and an omitted question", () => {
    expect(reservationRequestSchema.parse(valid).question).toBeUndefined();
    expect(validateStayRange(valid.checkIn, valid.checkOut, now)).toEqual({
      startDate: valid.checkIn,
      endDate: valid.checkOut,
    });
  });

  it("normalizes visitor text before persistence", () => {
    const parsed = reservationRequestSchema.parse({
      ...valid,
      fullName: "  Ana\u0000   Pérez  ",
      question: " Línea uno\r\nLínea dos ",
    });
    expect(parsed.fullName).toBe("Ana Pérez");
    expect(parsed.question).toBe("Línea uno\nLínea dos");
  });

  it("requires a meaningful name", () => {
    expect(() => reservationRequestSchema.parse({ ...valid, fullName: " " })).toThrow();
  });

  it("enforces the capacity of two guests", () => {
    expect(() => reservationRequestSchema.parse({ ...valid, guestCount: 3 })).toThrow(/2 personas/);
  });

  it("rejects past, one-night and beyond-horizon ranges", () => {
    expect(() => validateStayRange("2026-08-14", "2026-08-17", now)).toThrow(/ya pasó/);
    expect(() => validateStayRange("2026-09-20", "2026-09-21", now)).toThrow(/2 noches/);
    expect(() => validateStayRange("2027-08-14", "2027-08-16", now)).toThrow(/12 meses/);
  });
});
