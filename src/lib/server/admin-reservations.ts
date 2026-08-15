import "server-only";

import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { availabilityBlocks, reservationRequests } from "@/db/schema";
import {
  isRangeAvailable,
  parseLocalDate,
  type DateRange,
} from "@/lib/domain/dates";
import { getExternalCalendarHealth, getExternalIntervals } from "./availability";
import { DatesUnavailableError } from "./reservation-requests";

const AVAILABILITY_LOCK = 1446327911;

async function activeOverlaps(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  range: DateRange,
) {
  const rows = await tx
    .select({ startDate: availabilityBlocks.startDate, endDate: availabilityBlocks.endDate })
    .from(availabilityBlocks)
    .where(and(
      isNull(availabilityBlocks.releasedAt),
      lt(availabilityBlocks.startDate, range.endDate),
      gt(availabilityBlocks.endDate, range.startDate),
    ));
  return rows.map((row) => ({
    startDate: parseLocalDate(row.startDate),
    endDate: parseLocalDate(row.endDate),
  }));
}

export async function getAdminDashboardData() {
  const [requests, blocks, feeds] = await Promise.all([
    getDb().select().from(reservationRequests).orderBy(desc(reservationRequests.createdAt)),
    getDb().select().from(availabilityBlocks).orderBy(desc(availabilityBlocks.createdAt)),
    getExternalCalendarHealth(),
  ]);

  return {
    requests: requests.map((request) => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      anonymizedAt: request.anonymizedAt?.toISOString() ?? null,
    })),
    blocks: blocks.map((block) => ({
      ...block,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      releasedAt: block.releasedAt?.toISOString() ?? null,
    })),
    feeds,
  };
}

export async function confirmReservationRequest(requestId: string) {
  const [request] = await getDb()
    .select()
    .from(reservationRequests)
    .where(eq(reservationRequests.id, requestId))
    .limit(1);
  if (!request || request.status !== "PENDING") {
    throw new Error("La solicitud ya no está pendiente.");
  }

  const range = {
    startDate: parseLocalDate(request.checkIn),
    endDate: parseLocalDate(request.checkOut),
  };
  const external = await getExternalIntervals("strict");
  if (!isRangeAvailable(range, external)) throw new DatesUnavailableError();

  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${AVAILABILITY_LOCK})`);
    const [current] = await tx
      .select()
      .from(reservationRequests)
      .where(eq(reservationRequests.id, requestId))
      .limit(1);
    if (!current || current.status !== "PENDING") {
      throw new Error("La solicitud ya no está pendiente.");
    }
    const overlaps = await activeOverlaps(tx, range);
    if (!isRangeAvailable(range, overlaps)) throw new DatesUnavailableError();

    await tx.insert(availabilityBlocks).values({
      startDate: range.startDate,
      endDate: range.endDate,
      source: "DIRECT",
      reservationRequestId: requestId,
    });
    await tx.update(reservationRequests).set({
      status: "CONFIRMED",
      updatedAt: new Date(),
    }).where(eq(reservationRequests.id, requestId));
  });
}

export async function rejectReservationRequest(requestId: string) {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${AVAILABILITY_LOCK})`);
    const result = await tx.update(reservationRequests).set({
      status: "REJECTED",
      updatedAt: new Date(),
    }).where(and(
      eq(reservationRequests.id, requestId),
      eq(reservationRequests.status, "PENDING"),
    )).returning({ id: reservationRequests.id });
    if (!result.length) throw new Error("La solicitud ya no está pendiente.");
  });
}

export async function cancelConfirmedReservation(requestId: string) {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${AVAILABILITY_LOCK})`);
    const [request] = await tx.select().from(reservationRequests)
      .where(eq(reservationRequests.id, requestId)).limit(1);
    if (!request || request.status !== "CONFIRMED") {
      throw new Error("La solicitud no está confirmada.");
    }
    const released = await tx.update(availabilityBlocks).set({
      releasedAt: new Date(),
      updatedAt: new Date(),
    }).where(and(
      eq(availabilityBlocks.reservationRequestId, requestId),
      eq(availabilityBlocks.source, "DIRECT"),
      isNull(availabilityBlocks.releasedAt),
    )).returning({ id: availabilityBlocks.id });
    if (!released.length) throw new Error("No se encontró el bloqueo directo activo.");
    await tx.update(reservationRequests).set({
      status: "CANCELLED",
      updatedAt: new Date(),
    }).where(eq(reservationRequests.id, requestId));
  });
}

export async function createManualAvailabilityBlock(range: DateRange, reason?: string) {
  const external = await getExternalIntervals("strict");
  if (!isRangeAvailable(range, external)) throw new DatesUnavailableError();

  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${AVAILABILITY_LOCK})`);
    const overlaps = await activeOverlaps(tx, range);
    if (!isRangeAvailable(range, overlaps)) throw new DatesUnavailableError();
    await tx.insert(availabilityBlocks).values({
      startDate: range.startDate,
      endDate: range.endDate,
      source: "MANUAL",
      reason: reason ?? null,
    });
  });
}

export async function releaseManualAvailabilityBlock(blockId: string) {
  const released = await getDb().update(availabilityBlocks).set({
    releasedAt: new Date(),
    updatedAt: new Date(),
  }).where(and(
    eq(availabilityBlocks.id, blockId),
    eq(availabilityBlocks.source, "MANUAL"),
    isNull(availabilityBlocks.releasedAt),
  )).returning({ id: availabilityBlocks.id });
  if (!released.length) throw new Error("El bloqueo manual ya no está activo.");
}
