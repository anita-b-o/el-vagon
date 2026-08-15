import "server-only";

import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { availabilityBlocks, externalCalendarSnapshots } from "@/db/schema";
import { getDb } from "@/db";
import {
  addDays,
  addMonths,
  clipDateRange,
  mergeDateRanges,
  parseLocalDate,
  todayInArgentina,
  type DateRange,
} from "@/lib/domain/dates";
import { parseIcsIntervals } from "@/lib/domain/ics";

export type ExternalSource = "AIRBNB" | "BOOKING";
export type AvailabilityMode = "public" | "strict";

const PUBLIC_TTL_MS = 5 * 60 * 1000;
const PUBLIC_STALE_LIMIT_MS = 6 * 60 * 60 * 1000;

const sourceConfiguration: Array<{
  source: ExternalSource;
  env: "AIRBNB_ICAL_URL" | "BOOKING_ICAL_URL";
}> = [
  { source: "AIRBNB", env: "AIRBNB_ICAL_URL" },
  { source: "BOOKING", env: "BOOKING_ICAL_URL" },
];

export class ExternalCalendarsUnavailableError extends Error {
  constructor() {
    super("No pudimos verificar todos los calendarios externos.");
    this.name = "ExternalCalendarsUnavailableError";
  }
}

function ageInMs(value: Date, now: Date) {
  return Math.max(0, now.getTime() - value.getTime());
}

async function markRefreshFailure(source: ExternalSource) {
  const db = getDb();
  await db
    .update(externalCalendarSnapshots)
    .set({
      failedAt: new Date(),
      consecutiveFailures: sql`${externalCalendarSnapshots.consecutiveFailures} + 1`,
    })
    .where(eq(externalCalendarSnapshots.source, source));
}

async function refreshExternalCalendar(
  source: ExternalSource,
  url: string,
  snapshot: typeof externalCalendarSnapshots.$inferSelect | undefined,
  window: DateRange,
) {
  const headers = new Headers({ Accept: "text/calendar, text/plain;q=0.9" });
  if (snapshot?.etag) headers.set("If-None-Match", snapshot.etag);
  if (snapshot?.lastModified) headers.set("If-Modified-Since", snapshot.lastModified);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    const now = new Date();

    if (response.status === 304 && snapshot) {
      const [updated] = await getDb()
        .update(externalCalendarSnapshots)
        .set({ fetchedAt: now, failedAt: null, consecutiveFailures: 0 })
        .where(eq(externalCalendarSnapshots.source, source))
        .returning();
      return updated;
    }

    if (!response.ok) throw new Error("Respuesta de calendario inválida.");
    const raw = await response.text();
    if (raw.length > 2_000_000) throw new Error("Calendario demasiado grande.");
    const intervals = parseIcsIntervals(raw, window.startDate, window.endDate);

    const [updated] = await getDb()
      .insert(externalCalendarSnapshots)
      .values({
        source,
        intervals,
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
        fetchedAt: now,
        failedAt: null,
        consecutiveFailures: 0,
      })
      .onConflictDoUpdate({
        target: externalCalendarSnapshots.source,
        set: {
          intervals,
          etag: response.headers.get("etag"),
          lastModified: response.headers.get("last-modified"),
          fetchedAt: now,
          failedAt: null,
          consecutiveFailures: 0,
        },
      })
      .returning();
    return updated;
  } catch {
    if (snapshot) await markRefreshFailure(source);
    throw new ExternalCalendarsUnavailableError();
  }
}

async function getSourceIntervals(
  source: ExternalSource,
  url: string,
  mode: AvailabilityMode,
  window: DateRange,
  now: Date,
): Promise<DateRange[]> {
  const [snapshot] = await getDb()
    .select()
    .from(externalCalendarSnapshots)
    .where(eq(externalCalendarSnapshots.source, source))
    .limit(1);

  if (
    mode === "public" &&
    snapshot &&
    ageInMs(snapshot.fetchedAt, now) <= PUBLIC_TTL_MS
  ) {
    return snapshot.intervals.map((interval) => ({
      startDate: parseLocalDate(interval.startDate),
      endDate: parseLocalDate(interval.endDate),
    }));
  }

  try {
    const refreshed = await refreshExternalCalendar(source, url, snapshot, window);
    return refreshed.intervals.map((interval) => ({
      startDate: parseLocalDate(interval.startDate),
      endDate: parseLocalDate(interval.endDate),
    }));
  } catch (error) {
    if (
      mode === "public" &&
      snapshot &&
      ageInMs(snapshot.fetchedAt, now) <= PUBLIC_STALE_LIMIT_MS
    ) {
      return snapshot.intervals.map((interval) => ({
        startDate: parseLocalDate(interval.startDate),
        endDate: parseLocalDate(interval.endDate),
      }));
    }
    throw error;
  }
}

export function defaultAvailabilityWindow(now = new Date()): DateRange {
  const startDate = todayInArgentina(now);
  return { startDate, endDate: addDays(addMonths(startDate, 12), 1) };
}

export async function getExternalIntervals(
  mode: AvailabilityMode,
  window = defaultAvailabilityWindow(),
  now = new Date(),
) {
  const configured = sourceConfiguration.flatMap(({ source, env }) => {
    const url = process.env[env]?.trim();
    return url ? [{ source, url }] : [];
  });

  const results = await Promise.all(
    configured.map(({ source, url }) => getSourceIntervals(source, url, mode, window, now)),
  );
  return mergeDateRanges(results.flat());
}

export async function getActiveDatabaseIntervals(window: DateRange): Promise<DateRange[]> {
  const rows = await getDb()
    .select({
      startDate: availabilityBlocks.startDate,
      endDate: availabilityBlocks.endDate,
    })
    .from(availabilityBlocks)
    .where(
      and(
        isNull(availabilityBlocks.releasedAt),
        lt(availabilityBlocks.startDate, window.endDate),
        gt(availabilityBlocks.endDate, window.startDate),
      ),
    );
  return rows.map((row) => ({
    startDate: parseLocalDate(row.startDate),
    endDate: parseLocalDate(row.endDate),
  }));
}

export async function getCombinedAvailability(
  mode: AvailabilityMode,
  requestedWindow: DateRange,
) {
  const sourceWindow = defaultAvailabilityWindow();
  const [external, direct] = await Promise.all([
    getExternalIntervals(mode, sourceWindow),
    getActiveDatabaseIntervals(requestedWindow),
  ]);

  return mergeDateRanges([...external, ...direct])
    .map((range) => clipDateRange(range, requestedWindow))
    .filter((range): range is DateRange => range !== null);
}

export async function getExternalCalendarHealth() {
  const snapshots = await getDb().select().from(externalCalendarSnapshots);
  return sourceConfiguration.map(({ source, env }) => {
    const snapshot = snapshots.find((item) => item.source === source);
    return {
      source,
      configured: Boolean(process.env[env]?.trim()),
      fetchedAt: snapshot?.fetchedAt.toISOString() ?? null,
      failedAt: snapshot?.failedAt?.toISOString() ?? null,
      consecutiveFailures: snapshot?.consecutiveFailures ?? 0,
    };
  });
}

export async function forceRefreshExternalCalendars() {
  const window = defaultAvailabilityWindow();
  return getExternalIntervals("strict", window);
}
