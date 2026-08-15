import { describe, expect, it } from "vitest";
import { parseLocalDate } from "./dates";
import { buildPrivateCalendar, parseIcsIntervals } from "./ics";

const header = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Test//ES\r\n";
const footer = "END:VCALENDAR\r\n";

describe("iCalendar", () => {
  it("imports exclusive all-day events and ignores cancelled/transparent ones", () => {
    const raw = `${header}BEGIN:VEVENT\r\nUID:a\r\nDTSTART;VALUE=DATE:20260920\r\nDTEND;VALUE=DATE:20260923\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:b\r\nSTATUS:CANCELLED\r\nDTSTART;VALUE=DATE:20260924\r\nDTEND;VALUE=DATE:20260926\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:c\r\nTRANSP:TRANSPARENT\r\nDTSTART;VALUE=DATE:20260927\r\nDTEND;VALUE=DATE:20260929\r\nEND:VEVENT\r\n${footer}`;
    expect(parseIcsIntervals(raw, parseLocalDate("2026-09-01"), parseLocalDate("2026-10-01"))).toEqual([
      { startDate: "2026-09-20", endDate: "2026-09-23" },
    ]);
  });

  it("exports only generic availability without personal data", () => {
    const calendar = buildPrivateCalendar([{
      id: "public-block-id",
      startDate: parseLocalDate("2026-09-20"),
      endDate: parseLocalDate("2026-09-23"),
      updatedAt: new Date("2026-08-15T12:00:00Z"),
    }], new Date("2026-08-15T12:00:00Z"));
    expect(calendar).toContain("DTSTART;VALUE=DATE:20260920");
    expect(calendar).toContain("DTEND;VALUE=DATE:20260923");
    expect(calendar).toContain("SUMMARY:El Vagón - No disponible");
    expect(calendar).not.toMatch(/Ana|consulta|mantenimiento/i);
  });
});
