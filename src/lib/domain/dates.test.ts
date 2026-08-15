import { describe, expect, it } from "vitest";
import {
  addDays,
  isRangeAvailable,
  mergeDateRanges,
  nightsBetween,
  parseLocalDate,
  rangesOverlap,
  todayInArgentina,
} from "./dates";

const range = (startDate: string, endDate: string) => ({
  startDate: parseLocalDate(startDate),
  endDate: parseLocalDate(endDate),
});

describe("civil-date availability", () => {
  it("models stays as exclusive checkout intervals", () => {
    expect(nightsBetween(parseLocalDate("2026-10-10"), parseLocalDate("2026-10-13"))).toBe(3);
    expect(rangesOverlap(range("2026-10-10", "2026-10-13"), range("2026-10-13", "2026-10-16"))).toBe(false);
    expect(isRangeAvailable(range("2026-10-13", "2026-10-15"), [range("2026-10-10", "2026-10-13")])).toBe(true);
  });

  it("rejects any range that crosses an occupied night", () => {
    const occupied = [range("2026-10-12", "2026-10-14")];
    expect(isRangeAvailable(range("2026-10-10", "2026-10-12"), occupied)).toBe(true);
    expect(isRangeAvailable(range("2026-10-10", "2026-10-13"), occupied)).toBe(false);
    expect(isRangeAvailable(range("2026-10-14", "2026-10-16"), occupied)).toBe(true);
  });

  it("combines adjacent and overlapping feeds without losing exclusive boundaries", () => {
    expect(mergeDateRanges([
      range("2026-09-10", "2026-09-12"),
      range("2026-09-11", "2026-09-15"),
      range("2026-09-15", "2026-09-17"),
    ])).toEqual([range("2026-09-10", "2026-09-17")]);
  });

  it("calculates today in Argentina independently from UTC day", () => {
    expect(todayInArgentina(new Date("2026-08-16T01:30:00Z"))).toBe("2026-08-15");
    expect(addDays(parseLocalDate("2028-02-28"), 1)).toBe("2028-02-29");
  });
});
