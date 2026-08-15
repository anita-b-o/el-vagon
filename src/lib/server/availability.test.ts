import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  snapshot: null as null | {
    source: "AIRBNB";
    intervals: Array<{ startDate: string; endDate: string }>;
    etag: string | null;
    lastModified: string | null;
    fetchedAt: Date;
    failedAt: Date | null;
    consecutiveFailures: number;
  },
  updateCalls: 0,
}));

vi.mock("server-only", () => ({}));

vi.mock("@/db/schema", () => ({
  availabilityBlocks: {},
  externalCalendarSnapshots: {
    source: "source",
    fetchedAt: "fetchedAt",
    consecutiveFailures: "consecutiveFailures",
  },
}));

vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (state.snapshot ? [state.snapshot] : []),
        }),
      }),
    }),
    insert: () => ({
      values: (values: typeof state.snapshot) => ({
        onConflictDoUpdate: () => ({
          returning: async () => [values],
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => {
          state.updateCalls += 1;
          const query = Promise.resolve(undefined) as Promise<undefined> & {
            returning: () => Promise<Array<NonNullable<typeof state.snapshot>>>;
          };
          query.returning = async () => (state.snapshot ? [state.snapshot] : []);
          return query;
        },
      }),
    }),
  }),
}));

import {
  ExternalCalendarsUnavailableError,
  getExternalIntervals,
} from "./availability";
import { parseLocalDate } from "@/lib/domain/dates";

const window = {
  startDate: parseLocalDate("2026-08-01"),
  endDate: parseLocalDate("2026-09-01"),
};

const calendar = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Test//EN",
  "BEGIN:VEVENT",
  "UID:test-event",
  "DTSTART;VALUE=DATE:20260815",
  "DTEND;VALUE=DATE:20260817",
  "END:VEVENT",
  "END:VCALENDAR",
  "",
].join("\r\n");

describe("strict external availability", () => {
  beforeEach(() => {
    vi.stubEnv("AIRBNB_ICAL_URL", "https://calendar.example.test/airbnb.ics");
    vi.stubEnv("BOOKING_ICAL_URL", "");
    state.snapshot = {
      source: "AIRBNB",
      intervals: [{ startDate: "2026-08-20", endDate: "2026-08-22" }],
      etag: null,
      lastModified: null,
      fetchedAt: new Date("2026-08-15T17:00:00Z"),
      failedAt: null,
      consecutiveFailures: 0,
    };
    state.updateCalls = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fetches a fresh feed even when the snapshot was just updated", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(calendar, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getExternalIntervals(
      "strict",
      window,
      new Date("2026-08-15T17:00:00Z"),
    )).resolves.toEqual([{ startDate: "2026-08-15", endDate: "2026-08-17" }]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("fails closed when a configured feed cannot be refreshed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(getExternalIntervals(
      "strict",
      window,
      new Date("2026-08-15T17:00:00Z"),
    )).rejects.toBeInstanceOf(ExternalCalendarsUnavailableError);
    expect(state.updateCalls).toBe(1);
  });
});
